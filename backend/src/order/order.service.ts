import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma } from '@prisma/client';
import { ProductsService } from '../products/products.service';
import { ConfigService } from '@nestjs/config';
import { VNPayUtils } from 'src/vnpay/vnpay.utils';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
    private readonly configService: ConfigService
  ) {}

  async createOrder(
    userId: number,
    createOrderDto: CreateOrderDto,
    ipAddr: string
  ) {
    const { address, paymentMethod, note, cartId, phoneNumber, cartItemIds } =
      createOrderDto;

    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId, userId },
      include: {
        cartItems: {
          where: { id: { in: cartItemIds } },
          include: {
            product: true,
            color: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    if (cart.cartItems.length === 0) {
      throw new BadRequestException(
        'Không có sản phẩm nào được chọn trong giỏ hàng'
      );
    }

    if (cart.cartItems.length !== cartItemIds.length) {
      throw new BadRequestException(
        'Một số sản phẩm được chọn không có trong giỏ hàng'
      );
    }

    let totalAmount = 0;
    const orderDetails: any[] = [];
    const usedProductIdentityIds = new Set<string>();

    for (const item of cart.cartItems) {
      const { product, color, quantity } = item;

      if (!product) {
        throw new BadRequestException(
          `Sản phẩm ${item.productId} không tồn tại`
        );
      }

      const availableIdentities = await this.prisma.productIdentity.findMany({
        where: {
          productId: product.id,
          colorId: color.id,
          isSold: false,
        },
        take: quantity,
      });

      if (availableIdentities.length < quantity) {
        throw new BadRequestException(
          `Không đủ hàng tồn cho sản phẩm ${product.name} (màu ${color.name})`
        );
      }

      const itemPrice = await this.productsService.calculateDiscountedPrice(
        product.price,
        product.id
      );
      totalAmount += itemPrice * quantity;

      for (const identity of availableIdentities) {
        if (usedProductIdentityIds.has(identity.id)) {
          throw new BadRequestException(
            `productIdentityId ${identity.id} đã được sử dụng trong đơn hàng này. Dữ liệu trùng lặp trong productIdentity.`
          );
        }

        usedProductIdentityIds.add(identity.id);

        orderDetails.push({
          productId: product.id,
          colorId: color.id,
          productIdentityId: identity.id,
          originalPrice: product.price,
          discountedPrice: itemPrice,
        });
      }
    }

    let initialStatus: string;
    let initialPaymentStatus: string;

    if (paymentMethod === 'Online') {
      initialStatus = 'Pending';
      initialPaymentStatus = 'Pending';
    } else if (paymentMethod === 'COD') {
      initialStatus = 'Pending';
      initialPaymentStatus = 'Pending';
    } else {
      throw new BadRequestException('Phương thức thanh toán không hợp lệ');
    }

    try {
      const order = await this.prisma.$transaction(
        async tx => {
          const productIdentityIds = orderDetails.map(
            detail => detail.productIdentityId
          );

          // Kiểm tra xem productIdentityId có đang được sử dụng trong đơn hàng chưa hủy và chưa được trả
          const existingOrderDetails = await tx.orderDetail.findMany({
            where: {
              productIdentityId: { in: productIdentityIds },
              order: { status: { not: 'Canceled' } },
              returnStatus: false, // Chỉ tính các orderDetail chưa được trả
            },
            select: { productIdentityId: true },
          });

          if (existingOrderDetails.length > 0) {
            const usedProductIdentityIds = existingOrderDetails.map(
              detail => detail.productIdentityId
            );
            throw new BadRequestException(
              `Một số sản phẩm (productIdentityId: ${usedProductIdentityIds.join(
                ', '
              )}) đang được sử dụng trong các đơn hàng chưa hủy.`
            );
          }

          const existingProductIdentities = await tx.productIdentity.findMany({
            where: {
              id: { in: productIdentityIds },
              isSold: false,
            },
            select: { id: true },
          });

          if (existingProductIdentities.length !== productIdentityIds.length) {
            throw new BadRequestException(
              'Một số sản phẩm đã được bán trong lúc xử lý đơn hàng. Vui lòng thử lại.'
            );
          }

          const newOrder = await tx.order.create({
            data: {
              userId,
              address,
              totalAmount,
              paymentMethod,
              note,
              status: initialStatus as any,
              paymentStatus: initialPaymentStatus,
              phoneNumber,
            },
          });

          const orderDetailsWithOrderId = orderDetails.map(detail => ({
            ...detail,
            orderId: newOrder.id,
          }));

          await tx.orderDetail.createMany({
            data: orderDetailsWithOrderId,
          });

          await tx.productIdentity.updateMany({
            where: {
              id: { in: productIdentityIds },
            },
            data: { isSold: true },
          });

          await tx.cartItem.deleteMany({
            where: { id: { in: cartItemIds } },
          });

          return newOrder;
        },
        { timeout: 10000 }
      );

      let paymentUrl: string | undefined;
      if (paymentMethod === 'Online') {
        paymentUrl = VNPayUtils.createPaymentUrl({
          vnpayTmnCode: this.configService.get('VNPAY_TMN_CODE')!,
          vnpayHashSecret: this.configService.get('VNPAY_HASH_SECRET')!,
          vnpayUrl: this.configService.get('VNPAY_URL')!,
          orderId: order.id,
          amount: totalAmount,
          ipAddr,
          returnUrl: this.configService.get('VNPAY_RETURN_URL')!,
          orderInfo: `Thanh toan don hang ${order.id}`,
        });
      }

      return {
        message: 'Tạo đơn hàng thành công',
        data: {
          order,
          paymentUrl,
        },
      };
    } catch (error) {
      console.error('Transaction error:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Lỗi khi tạo đơn hàng: ' + error.message);
      }
      throw error;
    }
  }

  async handleVNPayReturn(query: { [key: string]: string }) {
    const isValid = VNPayUtils.verifyReturnUrl({
      vnpayHashSecret: this.configService.get('VNPAY_HASH_SECRET')!,
      query,
    });

    if (!isValid) {
      throw new BadRequestException('Chữ ký không hợp lệ');
    }

    const orderId = query['vnp_TxnRef'];
    const vnpResponseCode = query['vnp_ResponseCode'];
    const transactionStatus = query['vnp_TransactionStatus'];

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, fullName: true } },
        orderDetails: {
          include: {
            product: {
              include: {
                productFiles: {
                  include: {
                    file: true,
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

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    if (order.paymentStatus !== 'Pending') {
      throw new BadRequestException('Đơn hàng đã được xử lý thanh toán');
    }

    let newStatus = order.status;
    let newPaymentStatus = order.paymentStatus;

    if (vnpResponseCode === '00' && transactionStatus === '00') {
      newStatus = 'Confirmed';
      newPaymentStatus = 'Completed';
    } else {
      newStatus = 'Canceled';
      newPaymentStatus = 'Failed';

      await this.prisma.productIdentity.updateMany({
        where: {
          id: {
            in: order.orderDetails.map(detail => detail.productIdentityId),
          },
        },
        data: { isSold: false },
      });
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus as any,
        paymentStatus: newPaymentStatus,
      },
      include: {
        user: { select: { id: true, fullName: true } },
        orderDetails: {
          include: {
            product: {
              include: {
                productFiles: {
                  include: {
                    file: true,
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

    const updatedOrderDetails = updatedOrder.orderDetails.map(detail => {
      const mainImage =
        detail.product.productFiles.find(pf => pf.isMain) ||
        detail.product.productFiles[0];
      const imageUrl = mainImage?.file?.url || null;

      return {
        ...detail,
        product: {
          ...detail.product,
          price: detail.originalPrice,
          discountedPrice: detail.discountedPrice,
          imageUrl,
        },
      };
    });

    return {
      orderId: updatedOrder.id,
      isSuccess: vnpResponseCode === '00' && transactionStatus === '00',
      data: {
        ...updatedOrder,
        orderDetails: updatedOrderDetails,
      },
    };
  }

  async updateOrderStatus(
    orderId: string,
    requesterId: number,
    newStatus: string
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderDetails: {
          include: {
            productIdentity: {
              include: {
                product: true,
              },
            },
          },
        },
        user: { include: { role: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    const validStatuses = [
      'Pending',
      'Confirmed',
      'Shipping',
      'Delivered',
      'Canceled',
    ];
    if (!validStatuses.includes(newStatus)) {
      throw new BadRequestException('Trạng thái không hợp lệ');
    }

    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      include: { role: true },
    });

    if (!requester) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const isAdminOrEmployee = ['Admin', 'Employee'].includes(
      requester.role.name
    );
    const isOrderOwner = order.userId === requesterId;

    if (!isAdminOrEmployee && !isOrderOwner) {
      throw new BadRequestException('Bạn không có quyền cập nhật đơn hàng này');
    }

    if (!isAdminOrEmployee && newStatus !== 'Canceled') {
      throw new BadRequestException('Bạn chỉ có thể hủy đơn hàng của mình');
    }

    if (
      !isAdminOrEmployee &&
      newStatus === 'Canceled' &&
      order.status !== 'Pending'
    ) {
      throw new BadRequestException(
        'Bạn chỉ có thể hủy đơn hàng ở trạng thái Đang chờ'
      );
    }

    if (isAdminOrEmployee) {
      if (['Delivered', 'Canceled'].includes(order.status)) {
        throw new BadRequestException(
          `Không thể cập nhật trạng thái đơn hàng đã ở trạng thái ${
            order.status === 'Delivered' ? 'Đã giao' : 'Đã hủy'
          }`
        );
      }

      const validTransitions: { [key: string]: string[] } = {
        Pending: ['Confirmed', 'Canceled'],
        Confirmed: ['Shipping', 'Canceled'],
        Shipping: ['Delivered', 'Canceled'],
        Delivered: [],
        Canceled: [],
      };

      if (!validTransitions[order.status].includes(newStatus)) {
        throw new BadRequestException(
          `Không thể chuyển từ trạng thái ${this.translateStatus(
            order.status
          )} sang ${this.translateStatus(newStatus)}`
        );
      }
    }

    try {
      const updatedOrder = await this.prisma.$transaction(async tx => {
        let updatedPaymentStatus = order.paymentStatus;

        if (
          isAdminOrEmployee &&
          newStatus === 'Delivered' &&
          order.paymentMethod === 'COD' &&
          order.paymentStatus === 'Pending'
        ) {
          updatedPaymentStatus = 'Completed';
        }

        const updated = await tx.order.update({
          where: { id: orderId },
          data: {
            status: newStatus as any,
            paymentStatus: updatedPaymentStatus,
          },
          include: {
            user: { select: { id: true, fullName: true } },
            orderDetails: {
              include: {
                product: {
                  include: {
                    productFiles: {
                      include: {
                        file: true,
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

        if (newStatus === 'Delivered') {
          const productIdentityUpdates = order.orderDetails.map(
            async detail => {
              const productIdentity = detail.productIdentity;
              const product = detail.productIdentity.product;

              if (!productIdentity) {
                throw new BadRequestException(
                  `Không tìm thấy ProductIdentity cho OrderDetail ${detail.id}`
                );
              }

              const warrantyStartDate = new Date();
              const warrantyPeriod = product.warrantyPeriod || 12;
              const warrantyEndDate = new Date(warrantyStartDate);
              warrantyEndDate.setMonth(
                warrantyEndDate.getMonth() + warrantyPeriod
              );

              await tx.productIdentity.update({
                where: { id: productIdentity.id },
                data: {
                  warrantyStartDate: warrantyStartDate,
                  warrantyEndDate: warrantyEndDate,
                },
              });
            }
          );

          await Promise.all(productIdentityUpdates);
        }

        if (newStatus === 'Canceled') {
          const productIdentityIds = order.orderDetails.map(
            detail => detail.productIdentityId
          );

          if (productIdentityIds.length > 0) {
            await tx.productIdentity.updateMany({
              where: { id: { in: productIdentityIds } },
              data: {
                isSold: false,
                warrantyStartDate: null,
                warrantyEndDate: null,
              },
            });
          }
        }

        const updatedOrderDetails = updated.orderDetails.map(detail => {
          const mainImage =
            detail.product.productFiles.find(pf => pf.isMain) ||
            detail.product.productFiles[0];
          const imageUrl = mainImage?.file?.url || null;

          return {
            ...detail,
            product: {
              ...detail.product,
              price: detail.originalPrice,
              discountedPrice: detail.discountedPrice,
              imageUrl,
            },
          };
        });

        return {
          ...updated,
          orderDetails: updatedOrderDetails,
        };
      });

      return {
        message: 'Cập nhật trạng thái đơn hàng thành công',
        data: updatedOrder,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          `Lỗi khi cập nhật trạng thái đơn hàng: ${error.message} (Code: ${error.code})`
        );
      }
      throw new BadRequestException(
        `Lỗi không xác định khi cập nhật trạng thái: ${
          error.message || String(error)
        }`
      );
    }
  }

  private translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      Pending: 'Đang chờ',
      Confirmed: 'Đã xác nhận',
      Shipping: 'Đang giao',
      Delivered: 'Đã giao',
      Canceled: 'Đã hủy',
    };
    return statusMap[status] || status;
  }

  async getUserOrders(requesterId: number) {
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      include: { role: true },
    });

    if (!requester) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const isAdminOrEmployee = ['Admin', 'Employee'].includes(
      requester.role.name
    );

    const orders = await this.prisma.order.findMany({
      where: isAdminOrEmployee ? {} : { userId: requesterId },
      include: {
        user: { select: { id: true, fullName: true } },
        orderDetails: {
          include: {
            product: {
              include: {
                productFiles: {
                  include: {
                    file: true,
                  },
                },
              },
            },
            color: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const ordersWithDynamicPrices = orders.map(order => {
      const updatedOrderDetails = order.orderDetails.map(detail => {
        const mainImage =
          detail.product.productFiles.find(pf => pf.isMain) ||
          detail.product.productFiles[0];
        const imageUrl = mainImage?.file?.url || null;

        return {
          ...detail,
          product: {
            ...detail.product,
            price: detail.originalPrice,
            discountedPrice: detail.discountedPrice,
            imageUrl,
          },
        };
      });
      return {
        ...order,
        orderDetails: updatedOrderDetails,
      };
    });

    return {
      message: 'Lấy danh sách đơn hàng thành công',
      data: ordersWithDynamicPrices,
    };
  }

  async getOrderDetails(orderId: string, requesterId: number) {
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      include: { role: true },
    });

    if (!requester) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, fullName: true } },
        orderDetails: {
          include: {
            product: {
              include: {
                productFiles: {
                  include: {
                    file: true,
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

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    const isAdminOrEmployee = ['Admin', 'Employee'].includes(
      requester.role.name
    );
    const isOrderOwner = order.userId === requesterId;

    if (!isAdminOrEmployee && !isOrderOwner) {
      throw new BadRequestException('Bạn không có quyền xem đơn hàng này');
    }

    const updatedOrderDetails = order.orderDetails.map(detail => {
      const mainImage =
        detail.product.productFiles.find(pf => pf.isMain) ||
        detail.product.productFiles[0];
      const imageUrl = mainImage?.file?.url || null;

      return {
        ...detail,
        product: {
          ...detail.product,
          price: detail.originalPrice,
          discountedPrice: detail.discountedPrice,
          imageUrl,
        },
      };
    });

    return {
      message: 'Lấy chi tiết đơn hàng thành công',
      data: {
        ...order,
        orderDetails: updatedOrderDetails,
      },
    };
  }
}
