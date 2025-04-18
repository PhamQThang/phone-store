import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
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

      const itemPrice = product.discountedPrice || product.price;
      totalAmount += itemPrice * quantity;

      for (const identity of availableIdentities) {
        orderDetails.push({
          productId: product.id,
          colorId: color.id,
          productIdentityId: identity.id,
          price: itemPrice,
        });
      }
    }

    let initialStatus: string;
    let initialPaymentStatus: string;

    if (paymentMethod === 'Online') {
      initialStatus = 'Shipping';
      initialPaymentStatus = 'Completed';
    } else if (paymentMethod === 'COD') {
      initialStatus = 'Pending';
      initialPaymentStatus = 'Pending';
    } else {
      throw new BadRequestException('Phương thức thanh toán không hợp lệ');
    }

    try {
      const order = await this.prisma.$transaction(async tx => {
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
            id: { in: orderDetails.map(detail => detail.productIdentityId) },
          },
          data: { isSold: true },
        });

        await tx.cartItem.deleteMany({
          where: { id: { in: cartItemIds } },
        });

        return newOrder;
      });

      return {
        message: 'Tạo đơn hàng thành công',
        data: order,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Lỗi khi tạo đơn hàng: ' + error.message);
      }
      throw error;
    }
  }

  async updateOrderStatus(
    orderId: string,
    requesterId: number,
    newStatus: string
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { orderDetails: true, user: { include: { role: true } } },
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

    // Chỉ cho phép khách hàng hủy đơn hàng nếu trạng thái là Pending
    if (
      !isAdminOrEmployee &&
      newStatus === 'Canceled' &&
      order.status !== 'Pending'
    ) {
      throw new BadRequestException(
        'Bạn chỉ có thể hủy đơn hàng ở trạng thái Đang chờ'
      );
    }

    try {
      const updatedOrder = await this.prisma.$transaction(async tx => {
        const updated = await tx.order.update({
          where: { id: orderId },
          data: { status: newStatus as any },
        });

        if (newStatus === 'Canceled') {
          const productIdentityIds = order.orderDetails.map(
            detail => detail.productIdentityId
          );

          await tx.productIdentity.updateMany({
            where: { id: { in: productIdentityIds } },
            data: { isSold: false },
          });
        }

        return updated;
      });

      return {
        message: 'Cập nhật trạng thái đơn hàng thành công',
        data: updatedOrder,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          'Lỗi khi cập nhật trạng thái đơn hàng: ' + error.message
        );
      }
      throw error;
    }
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
        user: { select: { id: true, firstName: true, lastName: true } },
        orderDetails: {
          include: {
            product: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Lấy danh sách đơn hàng thành công',
      data: orders,
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
        user: { select: { id: true, firstName: true, lastName: true } },
        orderDetails: {
          include: {
            product: true,
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

    return {
      message: 'Lấy chi tiết đơn hàng thành công',
      data: order,
    };
  }
}
