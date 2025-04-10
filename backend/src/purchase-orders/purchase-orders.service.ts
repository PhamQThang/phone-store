// backend/src/purchase-orders/purchase-orders.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { Prisma } from '@prisma/client';

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
      throw new NotFoundException('Nhà cung cấp không tồn tại');
    }

    // Kiểm tra các sản phẩm, màu sắc và IMEI trong chi tiết đơn nhập hàng
    for (const detail of details) {
      // Kiểm tra sản phẩm
      const product = await this.prisma.product.findUnique({
        where: { id: detail.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Sản phẩm với ID ${detail.productId} không tồn tại`
        );
      }

      // Kiểm tra màu sắc
      const color = await this.prisma.color.findUnique({
        where: { id: detail.colorId },
      });
      if (!color) {
        throw new NotFoundException(
          `Màu sắc với ID ${detail.colorId} không tồn tại`
        );
      }

      // Kiểm tra IMEI có bị trùng không
      const existingProductIdentity =
        await this.prisma.productIdentity.findUnique({
          where: { imei: detail.imei },
        });
      if (existingProductIdentity) {
        throw new BadRequestException(`IMEI ${detail.imei} đã tồn tại`);
      }
    }

    try {
      // Tính tổng chi phí
      const totalCost = details.reduce(
        (sum, detail) => sum + detail.importPrice,
        0
      );

      // Tạo đơn nhập hàng
      const purchaseOrder = await this.prisma.purchaseOrder.create({
        data: {
          supplierId,
          totalCost,
          status: 'Pending',
          note,
          createdById,
          purchaseOrderDetails: {
            create: await Promise.all(
              details.map(async detail => {
                // Tạo ProductIdentity trước
                const productIdentity =
                  await this.prisma.productIdentity.create({
                    data: {
                      imei: detail.imei,
                      colorId: detail.colorId,
                      productId: detail.productId,
                      isSold: false,
                    },
                  });

                return {
                  productId: detail.productId,
                  colorId: detail.colorId,
                  productIdentityId: productIdentity.id,
                  importPrice: detail.importPrice,
                };
              })
            ),
          },
        },
        include: {
          supplier: true,
          createdBy: true,
          purchaseOrderDetails: {
            include: {
              product: true,
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
            'Dữ liệu bị trùng (có thể là IMEI hoặc khóa chính)'
          );
        }
      }
      throw new BadRequestException('Không thể tạo đơn nhập hàng');
    }
  }

  // Lấy danh sách tất cả các đơn nhập hàng
  async findAll() {
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        createdBy: true,
        purchaseOrderDetails: {
          include: {
            product: true,
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
        createdBy: true,
        purchaseOrderDetails: {
          include: {
            product: true,
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

  // Cập nhật trạng thái đơn nhập hàng
  async update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        purchaseOrderDetails: {
          include: {
            product: true,
            color: true,
            productIdentity: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Đơn nhập hàng không tồn tại');
    }

    const { status } = updatePurchaseOrderDto;

    // Nếu trạng thái mới là Done, không cần tạo ProductIdentity vì đã tạo trước đó
    // Cập nhật trạng thái đơn nhập hàng
    const updatedPurchaseOrder = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status },
      include: {
        supplier: true,
        createdBy: true,
        purchaseOrderDetails: {
          include: {
            product: true,
            color: true,
            productIdentity: true,
          },
        },
      },
    });

    return {
      message: 'Cập nhật đơn nhập hàng thành công',
      data: updatedPurchaseOrder,
    };
  }

  // Xóa đơn nhập hàng
  async remove(id: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { purchaseOrderDetails: true },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Đơn nhập hàng không tồn tại');
    }

    if (purchaseOrder.status === 'Done') {
      throw new BadRequestException('Không thể xóa đơn nhập hàng đã hoàn tất');
    }

    try {
      // Xóa các ProductIdentity liên quan
      const productIdentityIds = purchaseOrder.purchaseOrderDetails.map(
        detail => detail.productIdentityId
      );
      await this.prisma.productIdentity.deleteMany({
        where: {
          id: { in: productIdentityIds },
        },
      });

      // Xóa đơn nhập hàng (các PurchaseOrderDetail sẽ tự động bị xóa do quan hệ cascade)
      await this.prisma.purchaseOrder.delete({
        where: { id },
      });

      return {
        message: 'Xóa đơn nhập hàng thành công',
      };
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
}
