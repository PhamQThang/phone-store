/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// backend/src/purchase-orders/purchase-orders.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { Prisma, PurchaseOrderDetail } from '@prisma/client';

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo đơn nhập hàng mới
  async create(
    createPurchaseOrderDto: CreatePurchaseOrderDto,
    createdById: number
  ) {
    const { supplierId, details, note } = createPurchaseOrderDto;

    // Kiểm tra nhà cung cấp có tồn tại không
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    });
    if (!supplier) {
      throw new NotFoundException(
        `Nhà cung cấp với ID ${supplierId} không tồn tại`
      );
    }

    // Kiểm tra các sản phẩm, màu sắc và IMEI trong chi tiết đơn nhập hàng
    for (const detail of details) {
      const product = await this.prisma.product.findUnique({
        where: { id: detail.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Sản phẩm với ID ${detail.productId} không tồn tại`
        );
      }

      const color = await this.prisma.color.findUnique({
        where: { id: detail.colorId },
      });
      if (!color) {
        throw new NotFoundException(
          `Màu sắc với ID ${detail.colorId} không tồn tại`
        );
      }

      const existingProductIdentity =
        await this.prisma.productIdentity.findUnique({
          where: { imei: detail.imei },
        });
      if (existingProductIdentity) {
        throw new BadRequestException(
          `IMEI ${detail.imei} đã tồn tại trong bảng ProductIdentity`
        );
      }
    }

    try {
      const totalCost = details.reduce(
        (sum, detail) => sum + detail.importPrice,
        0
      );

      const purchaseOrder = await this.prisma.purchaseOrder.create({
        data: {
          supplierId,
          totalCost,
          status: 'Pending',
          note,
          createdById,
          purchaseOrderDetails: {
            create: details.map(detail => ({
              product: { connect: { id: detail.productId } },
              color: { connect: { id: detail.colorId } },
              importPrice: detail.importPrice,
              imei: detail.imei,
            })),
          },
        },
        include: {
          supplier: true,
          createdBy: {
            select: {
              id: true,
              email: true,
              fullName: true,
              address: true,
              phoneNumber: true,
              roleId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          purchaseOrderDetails: {
            include: {
              product: {
                include: {
                  model: {
                    include: {
                      brand: true,
                    },
                  },
                },
              },
              color: true,
              productIdentity: true,
            },
          },
        },
      });

      return {
        message: 'Tạo đơn nhập hàng thành công',
        data: purchaseOrder,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Dữ liệu bị trùng (có thể là IMEI hoặc khóa chính): ' +
              error.message
          );
        }
        throw new BadRequestException(
          `Không thể tạo đơn nhập hàng: ${error.message}`
        );
      }
      throw new BadRequestException(
        `Không thể tạo đơn nhập hàng: ${error.message || 'Lỗi không xác định'}`
      );
    }
  }

  // Lấy danh sách tất cả các đơn nhập hàng
  async findAll() {
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
            address: true,
            phoneNumber: true,
            roleId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        purchaseOrderDetails: {
          include: {
            product: {
              include: {
                model: {
                  include: {
                    brand: true,
                  },
                },
              },
            },
            color: true,
            productIdentity: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Lấy danh sách đơn nhập hàng thành công',
      data: purchaseOrders,
    };
  }

  // Lấy chi tiết một đơn nhập hàng
  async findOne(id: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
            address: true,
            phoneNumber: true,
            roleId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        purchaseOrderDetails: {
          include: {
            product: {
              include: {
                model: {
                  include: {
                    brand: true,
                  },
                },
              },
            },
            color: true,
            productIdentity: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Đơn nhập hàng không tồn tại');
    }

    return {
      message: 'Lấy chi tiết đơn nhập hàng thành công',
      data: purchaseOrder,
    };
  }

  async update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    const { status, detailsToDelete, detailsToUpdate, details } =
      updatePurchaseOrderDto;

    try {
      return await this.prisma.$transaction(
        async prisma => {
          const purchaseOrder = await prisma.purchaseOrder.findUnique({
            where: { id },
            include: { purchaseOrderDetails: true },
          });

          if (!purchaseOrder) {
            throw new NotFoundException(
              `Đơn nhập hàng với ID ${id} không tồn tại`
            );
          }

          if (purchaseOrder.status === 'Done') {
            throw new BadRequestException(
              'Không thể chỉnh sửa đơn nhập hàng đã hoàn tất'
            );
          }

          // ===================== XÓA =====================
          console.log('detailsToDelete:', detailsToDelete);
          if (detailsToDelete?.length) {
            const deleteDetails = await prisma.purchaseOrderDetail.findMany({
              where: { id: { in: detailsToDelete } },
            });
            console.log('deleteDetails:', deleteDetails);

            for (const detail of deleteDetails) {
              if (detail.productIdentityId) {
                throw new BadRequestException(
                  `Chi tiết ${detail.id} đã gắn ProductIdentity`
                );
              }
            }

            const deleteResult = await prisma.purchaseOrderDetail.deleteMany({
              where: { id: { in: detailsToDelete } },
            });
            console.log('deleteResult:', deleteResult);
          }

          // Lấy lại danh sách chi tiết còn lại sau khi xóa
          const remainingDetailsAfterDelete =
            await prisma.purchaseOrderDetail.findMany({
              where: { importId: id },
            });
          console.log(
            'remainingDetailsAfterDelete:',
            remainingDetailsAfterDelete
          );

          // ===================== CẬP NHẬT =====================
          if (detailsToUpdate?.length) {
            const updateIds = detailsToUpdate.map(d => d.id);
            const existingDetails = await prisma.purchaseOrderDetail.findMany({
              where: { id: { in: updateIds } },
            });

            for (const detail of detailsToUpdate) {
              const current = existingDetails.find(d => d.id === detail.id);
              if (!current) {
                throw new NotFoundException(
                  `Chi tiết ${detail.id} không tồn tại`
                );
              }
              if (current.productIdentityId) {
                throw new BadRequestException(
                  `Chi tiết ${detail.id} đã gắn ProductIdentity`
                );
              }
            }

            const productIds = [
              ...new Set(detailsToUpdate.map(d => d.productId)),
            ];
            const colorIds = [...new Set(detailsToUpdate.map(d => d.colorId))];

            const [products, colors] = await Promise.all([
              prisma.product.findMany({ where: { id: { in: productIds } } }),
              prisma.color.findMany({ where: { id: { in: colorIds } } }),
            ]);

            const updatePromises = detailsToUpdate.map(detail => {
              const product = products.find(p => p.id === detail.productId);
              const color = colors.find(c => c.id === detail.colorId);

              if (!product) {
                throw new NotFoundException(
                  `Sản phẩm ${detail.productId} không tồn tại`
                );
              }
              if (!color) {
                throw new NotFoundException(
                  `Màu sắc ${detail.colorId} không tồn tại`
                );
              }

              return prisma.purchaseOrderDetail.update({
                where: { id: detail.id },
                data: {
                  productId: detail.productId,
                  colorId: detail.colorId,
                  imei: detail.imei,
                  importPrice: detail.importPrice,
                },
              });
            });

            await Promise.all(updatePromises);
          }

          // Lấy lại danh sách chi tiết sau khi cập nhật
          const remainingDetailsAfterUpdate =
            await prisma.purchaseOrderDetail.findMany({
              where: { importId: id },
            });
          console.log(
            'remainingDetailsAfterUpdate:',
            remainingDetailsAfterUpdate
          );

          // ===================== TẠO MỚI =====================
          let createdDetails: PurchaseOrderDetail[] = [];

          if (details?.length) {
            const imeis = details.map(d => d.imei);
            const existingImeis = await prisma.productIdentity.findMany({
              where: { imei: { in: imeis } },
            });

            const duplicateImeis = existingImeis.map(p => p.imei);
            if (duplicateImeis.length > 0) {
              throw new BadRequestException(
                `IMEI đã tồn tại: ${duplicateImeis.join(', ')}`
              );
            }

            const productIds = [...new Set(details.map(d => d.productId))];
            const colorIds = [...new Set(details.map(d => d.colorId))];

            const [products, colors] = await Promise.all([
              prisma.product.findMany({ where: { id: { in: productIds } } }),
              prisma.color.findMany({ where: { id: { in: colorIds } } }),
            ]);

            const createPromises = details.map(detail => {
              const product = products.find(p => p.id === detail.productId);
              const color = colors.find(c => c.id === detail.colorId);

              if (!product) {
                throw new NotFoundException(
                  `Sản phẩm ${detail.productId} không tồn tại`
                );
              }
              if (!color) {
                throw new NotFoundException(
                  `Màu sắc ${detail.colorId} không tồn tại`
                );
              }

              return prisma.purchaseOrderDetail.create({
                data: {
                  importId: id,
                  productId: detail.productId,
                  colorId: detail.colorId,
                  imei: detail.imei,
                  importPrice: detail.importPrice,
                },
              });
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            createdDetails = await Promise.all(createPromises);
          }

          // ===================== TÍNH TỔNG TIỀN =====================
          const finalDetails = await prisma.purchaseOrderDetail.findMany({
            where: { importId: id },
          });
          console.log('finalDetails:', finalDetails);

          const totalCost = finalDetails.reduce(
            (sum, d) => sum + d.importPrice,
            0
          );
          console.log('Calculated totalCost:', totalCost);

          const updatedPurchaseOrder = await prisma.purchaseOrder.update({
            where: { id },
            data: { status, totalCost },
            include: {
              purchaseOrderDetails: {
                include: {
                  product: { include: { model: { include: { brand: true } } } },
                  color: true,
                  productIdentity: true,
                },
              },
              supplier: true,
              createdBy: true,
            },
          });

          // ===================== XỬ LÝ NẾU DONE =====================
          if (status === 'Done' && purchaseOrder.status !== 'Done') {
            const detailsToCreateIdentity =
              updatedPurchaseOrder.purchaseOrderDetails.filter(
                d => !d.productIdentityId
              );

            const createIdentities = await Promise.all(
              detailsToCreateIdentity.map(detail =>
                prisma.productIdentity.create({
                  data: {
                    imei: detail.imei,
                    colorId: detail.colorId,
                    productId: detail.productId,
                    isSold: false,
                  },
                })
              )
            );

            await Promise.all(
              detailsToCreateIdentity.map((detail, index) =>
                prisma.purchaseOrderDetail.update({
                  where: { id: detail.id },
                  data: { productIdentityId: createIdentities[index].id },
                })
              )
            );
          }

          return updatedPurchaseOrder;
        },
        { timeout: 10000 }
      );
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  // Xóa đơn nhập hàng
  async remove(id: string) {
    try {
      return await this.prisma.$transaction(async prisma => {
        // Tìm đơn nhập hàng và bao gồm chi tiết
        const purchaseOrder = await prisma.purchaseOrder.findUnique({
          where: { id },
          include: { purchaseOrderDetails: true },
        });

        if (!purchaseOrder) {
          throw new NotFoundException('Đơn nhập hàng không tồn tại');
        }

        if (purchaseOrder.status === 'Done') {
          throw new BadRequestException(
            'Không thể xóa đơn nhập hàng đã hoàn tất'
          );
        }

        // Kiểm tra xem có chi tiết nào đã gắn ProductIdentity không
        const hasProductIdentity = purchaseOrder.purchaseOrderDetails.some(
          detail => detail.productIdentityId
        );
        if (hasProductIdentity) {
          throw new BadRequestException(
            'Không thể xóa đơn nhập hàng vì có chi tiết đã gắn ProductIdentity'
          );
        }

        // Xóa tất cả PurchaseOrderDetail liên quan
        await prisma.purchaseOrderDetail.deleteMany({
          where: { importId: id },
        });

        // Xóa PurchaseOrder
        await prisma.purchaseOrder.delete({
          where: { id },
        });

        return {
          message: 'Xóa đơn nhập hàng thành công',
        };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Không thể xóa đơn nhập hàng vì có dữ liệu liên quan'
          );
        }
      }
      throw error;
    }
  }

  async getPurchaseOrderDetail(id: string) {
    const detail = await this.prisma.purchaseOrderDetail.findUnique({
      where: { id },
    });

    if (!detail) {
      throw new NotFoundException(
        `Chi tiết đơn nhập hàng với ID ${id} không tồn tại`
      );
    }

    return detail;
  }
}
