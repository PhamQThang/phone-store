import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface OrderDetailStat {
  orderId: string;
  productId: string;
  productName: string;
  importPrice: number;
  sellingPrice: number;
  profit: number;
  imei: string;
}

export interface ReturnTicketStat {
  id: string;
  productIdentityId: string;
  imei: string;
  originalPrice: number | null;
  discountedPrice: number | null;
  status: string;
  startDate: Date;
  endDate: Date;
  note: string | null;
  createdAt: Date;
}

export interface DailyStat {
  date: string;
  totalPurchaseAmount: number;
  totalSellingPrice: number;
  totalProfit: number;
  totalOrders: number;
  totalProcessing: number;
  totalDelivered: number;
  totalCancelled: number;
  totalProductsSold: number;
  totalReturnAmount: number;
  totalReturnTickets: number;
  totalProcessedReturnTickets: number;
  totalPendingReturnTickets: number;
  orders: OrderDetailStat[];
}

export interface StoreSummaryStats {
  totalCustomers: number;
  totalProductsSold: number;
  totalPurchaseAmount: number;
  totalSellingPrice: number;
  totalReturnAmount: number;
  totalProfit: number;
  totalOrders: number;
}

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrderStats(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException(
        'Ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD.'
      );
    }
    if (start > end) {
      throw new BadRequestException(
        'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.'
      );
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const deliveredOrders = await this.prisma.order.findMany({
      where: {
        status: 'Delivered',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        orderDetails: {
          include: {
            product: true,
            productIdentity: {
              include: {
                purchaseOrderDetail: true,
              },
            },
          },
        },
      },
    });

    const returnTickets = await this.prisma.returnTicket.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: 'Returned',
        productIdentity: {
          orderDetail: {
            some: {
              order: {
                createdAt: {
                  gte: start,
                  lte: end,
                },
              },
            },
          },
        },
      },
      include: {
        productIdentity: {
          include: {
            purchaseOrderDetail: true,
            orderDetail: {
              include: {
                order: true,
              },
            },
          },
        },
      },
    });

    const dailyStats: DailyStat[] = [];
    for (let i = 0; i < diffDays; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i + 1);
      const dateStr = currentDate.toISOString().split('T')[0];
      dailyStats.push({
        date: dateStr,
        totalPurchaseAmount: 0,
        totalSellingPrice: 0,
        totalProfit: 0,
        totalOrders: 0,
        totalProcessing: 0,
        totalDelivered: 0,
        totalCancelled: 0,
        totalProductsSold: 0,
        totalReturnAmount: 0,
        totalReturnTickets: 0,
        totalProcessedReturnTickets: 0,
        totalPendingReturnTickets: 0,
        orders: [],
      });
    }

    const getNormalizedDate = (date: Date): Date => {
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      return normalized;
    };

    const productIdentitiesSold = await this.prisma.productIdentity.findMany({
      where: {
        orderDetail: {
          some: {
            order: {
              status: 'Delivered',
              createdAt: {
                gte: start,
                lte: end,
              },
            },
          },
        },
      },
      include: {
        purchaseOrderDetail: true,
        orderDetail: {
          include: {
            order: true,
          },
        },
      },
    });

    const totalPurchaseAmountMap = new Map<string, number>();
    productIdentitiesSold.forEach(pi => {
      const orderDate = pi.orderDetail[0]?.order?.createdAt
        ? getNormalizedDate(pi.orderDetail[0].order.createdAt)
        : start;
      const dateStr = orderDate.toISOString().split('T')[0];
      const importPrice = pi.purchaseOrderDetail?.importPrice || 0;
      totalPurchaseAmountMap.set(
        dateStr,
        (totalPurchaseAmountMap.get(dateStr) || 0) + importPrice
      );
    });

    const allOrders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        orderDetails: true,
      },
    });

    allOrders.forEach(order => {
      const orderDate = getNormalizedDate(order.createdAt);
      const dayIndex = Math.floor(
        (orderDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      dailyStats[dayIndex].totalOrders += 1;

      if (order.status === 'Delivered') {
        dailyStats[dayIndex].totalDelivered += 1;
        dailyStats[dayIndex].totalProductsSold += order.orderDetails.length;
      } else if (['Pending', 'Confirmed', 'Shipping'].includes(order.status)) {
        dailyStats[dayIndex].totalProcessing += 1;
      } else if (order.status === 'Canceled') {
        dailyStats[dayIndex].totalCancelled += 1;
      }
    });

    deliveredOrders.forEach(order => {
      const orderDate = getNormalizedDate(order.createdAt);
      const dayIndex = Math.floor(
        (orderDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      const dateStr = orderDate.toISOString().split('T')[0];

      order.orderDetails.forEach(detail => {
        const originalPrice = detail.originalPrice || 0;
        const discountedPrice = detail.discountedPrice || 0;
        let sellingPrice =
          originalPrice === discountedPrice ? originalPrice : discountedPrice;

        const importPrice =
          detail.productIdentity?.purchaseOrderDetail?.importPrice || 0;

        dailyStats[dayIndex].totalSellingPrice += sellingPrice;
        dailyStats[dayIndex].orders.push({
          orderId: order.id,
          productId: detail.productId,
          productName: detail.product.name,
          importPrice,
          sellingPrice,
          profit: sellingPrice - importPrice,
          imei: detail.productIdentity?.imei || 'Không có IMEI',
        });
      });

      dailyStats[dayIndex].totalPurchaseAmount =
        totalPurchaseAmountMap.get(dateStr) || 0;
    });

    const profitFromReturnedItemsMap = new Map<string, number>();
    returnTickets.forEach(ticket => {
      const ticketDate = getNormalizedDate(ticket.createdAt);
      const dayIndex = Math.floor(
        (ticketDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      const dateStr = ticketDate.toISOString().split('T')[0];

      dailyStats[dayIndex].totalReturnTickets += 1;
      const returnAmount = ticket.discountedPrice || ticket.originalPrice || 0;
      dailyStats[dayIndex].totalReturnAmount += returnAmount;

      if (ticket.status === 'Returned') {
        dailyStats[dayIndex].totalProcessedReturnTickets += 1;

        const productIdentity = ticket.productIdentity;
        if (
          productIdentity &&
          productIdentity.orderDetail &&
          productIdentity.orderDetail.length > 0
        ) {
          const orderDetail = productIdentity.orderDetail[0];
          const orderDate = getNormalizedDate(orderDetail.order.createdAt);
          const orderDayIndex = Math.floor(
            (orderDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          );
          const sellingPrice =
            orderDetail.discountedPrice || orderDetail.originalPrice || 0;
          const importPrice =
            productIdentity.purchaseOrderDetail?.importPrice || 0;
          const profit = sellingPrice - importPrice;

          // Gán lợi nhuận âm vào ngày của đơn hàng ban đầu
          profitFromReturnedItemsMap.set(
            dailyStats[orderDayIndex].date,
            (profitFromReturnedItemsMap.get(dailyStats[orderDayIndex].date) ||
              0) + profit
          );
        }
      } else if (ticket.status === 'Processing') {
        dailyStats[dayIndex].totalPendingReturnTickets += 1;
      }
    });

    dailyStats.forEach(stat => {
      const totalProfitBeforeReturns =
        stat.totalSellingPrice - stat.totalPurchaseAmount;
      const profitFromReturnedItems =
        profitFromReturnedItemsMap.get(stat.date) || 0;
      stat.totalProfit =
        totalProfitBeforeReturns >= 0
          ? totalProfitBeforeReturns - profitFromReturnedItems
          : 0; // Đảm bảo totalProfit không âm nếu không có doanh thu
    });

    return {
      message: `Thống kê đơn hàng và nhập hàng từ ${start.toLocaleDateString('vi-VN')} đến ${end.toLocaleDateString('vi-VN')} thành công`,
      data: dailyStats,
    };
  }

  async getDailyProfitStats(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException(
        'Ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD.'
      );
    }
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const deliveredOrders = await this.prisma.order.findMany({
      where: {
        status: 'Delivered',
        createdAt: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      include: {
        orderDetails: {
          include: {
            product: true,
            productIdentity: {
              include: {
                purchaseOrderDetail: true,
              },
            },
          },
        },
      },
    });

    const returnTickets = await this.prisma.returnTicket.findMany({
      where: {
        createdAt: {
          gte: targetDate,
          lt: nextDay,
        },
        status: 'Returned',
      },
      include: {
        productIdentity: {
          include: {
            purchaseOrderDetail: true,
            orderDetail: {
              include: {
                order: true,
              },
            },
          },
        },
      },
    });

    let totalSellingPrice = 0;
    const detailedStats = deliveredOrders.flatMap(order =>
      order.orderDetails.map(detail => {
        const originalPrice = detail.originalPrice || 0;
        const discountedPrice = detail.discountedPrice || 0;
        const sellingPrice =
          originalPrice === discountedPrice ? originalPrice : discountedPrice;
        totalSellingPrice += sellingPrice;

        const importPrice =
          detail.productIdentity?.purchaseOrderDetail?.importPrice || 0;

        return {
          orderId: order.id,
          productId: detail.productId,
          productName: detail.product.name,
          importPrice,
          sellingPrice,
          profit: sellingPrice - importPrice,
          imei: detail.productIdentity?.imei || 'Không có IMEI',
        };
      })
    );

    const productIdentitiesSold = await this.prisma.productIdentity.findMany({
      where: {
        orderDetail: {
          some: {
            order: {
              status: 'Delivered',
              createdAt: {
                gte: targetDate,
                lt: nextDay,
              },
            },
          },
        },
      },
      include: {
        purchaseOrderDetail: true,
      },
    });

    const totalPurchaseAmount = productIdentitiesSold.reduce((sum, pi) => {
      return sum + (pi.purchaseOrderDetail?.importPrice || 0);
    }, 0);

    const totalReturnAmount = returnTickets.reduce((sum, ticket) => {
      return sum + (ticket.discountedPrice || ticket.originalPrice || 0);
    }, 0);

    const totalRevenue = totalSellingPrice;
    const netRevenue = totalSellingPrice - totalReturnAmount;

    // Tính tổng doanh thu - tổng nhập hàng (của tất cả sản phẩm)
    const totalProfitBeforeReturns = totalSellingPrice - totalPurchaseAmount;

    // Tính tổng doanh thu - tổng nhập hàng (của sản phẩm đã đổi trả)
    let profitFromReturnedItems = 0;
    returnTickets.forEach(ticket => {
      const productIdentity = ticket.productIdentity;
      if (
        productIdentity &&
        productIdentity.orderDetail &&
        productIdentity.orderDetail.length > 0
      ) {
        const orderDetail = productIdentity.orderDetail[0];
        const sellingPrice =
          orderDetail.discountedPrice || orderDetail.originalPrice || 0;
        const importPrice =
          productIdentity.purchaseOrderDetail?.importPrice || 0;
        profitFromReturnedItems += sellingPrice - importPrice;
      }
    });

    // Lợi nhuận cuối cùng
    const totalProfit = totalProfitBeforeReturns - profitFromReturnedItems;

    const returnTicketDetails: ReturnTicketStat[] = returnTickets.map(
      ticket => ({
        id: ticket.id,
        productIdentityId: ticket.productIdentityId,
        imei: ticket.productIdentity?.imei || 'Không có IMEI',
        originalPrice: ticket.originalPrice,
        discountedPrice: ticket.discountedPrice,
        status: ticket.status,
        startDate: ticket.startDate,
        endDate: ticket.endDate,
        note: ticket.note,
        createdAt: ticket.createdAt,
      })
    );

    return {
      message: `Thống kê lợi nhuận trong ngày ${targetDate.toLocaleDateString('vi-VN')} thành công`,
      data: {
        summary: {
          totalPurchaseAmount,
          totalSellingPrice,
          totalProfit,
          totalRevenue,
          totalReturnAmount,
          netRevenue,
        },
        details: detailedStats,
        returnTickets: returnTicketDetails,
      },
    };
  }

  async getStoreSummaryStats(): Promise<StoreSummaryStats> {
    const totalCustomers = await this.prisma.user.count({
      where: {
        role: {
          name: 'Customer',
        },
      },
    });

    const totalProductsSold = await this.prisma.productIdentity.count({
      where: {
        isSold: true,
      },
    });

    const deliveredOrders = await this.prisma.order.findMany({
      where: {
        status: 'Delivered',
      },
      include: {
        orderDetails: {
          include: {
            productIdentity: {
              include: {
                purchaseOrderDetail: true,
              },
            },
          },
        },
      },
    });

    let totalSellingPrice = 0;
    deliveredOrders.forEach(order => {
      order.orderDetails.forEach(detail => {
        const sellingPrice =
          detail.discountedPrice || detail.originalPrice || 0;
        totalSellingPrice += sellingPrice;
      });
    });

    const productIdentitiesSold = await this.prisma.productIdentity.findMany({
      where: {
        orderDetail: {
          some: {
            order: {
              status: 'Delivered',
            },
          },
        },
      },
      include: {
        purchaseOrderDetail: true,
      },
    });
    const totalPurchaseAmount = productIdentitiesSold.reduce((sum, pi) => {
      return sum + (pi.purchaseOrderDetail?.importPrice || 0);
    }, 0);

    const returnTickets = await this.prisma.returnTicket.findMany({
      where: {
        status: 'Returned',
      },
      include: {
        productIdentity: {
          include: {
            purchaseOrderDetail: true,
            orderDetail: {
              include: {
                order: true,
              },
            },
          },
        },
      },
    });

    const totalReturnAmount = returnTickets.reduce((sum, ticket) => {
      return sum + (ticket.discountedPrice || ticket.originalPrice || 0);
    }, 0);

    // Tính tổng doanh thu - tổng nhập hàng (của tất cả sản phẩm)
    const totalProfitBeforeReturns = totalSellingPrice - totalPurchaseAmount;

    // Tính tổng doanh thu - tổng nhập hàng (của sản phẩm đã đổi trả)
    let profitFromReturnedItems = 0;
    returnTickets.forEach(ticket => {
      const productIdentity = ticket.productIdentity;
      if (
        productIdentity &&
        productIdentity.orderDetail &&
        productIdentity.orderDetail.length > 0
      ) {
        const orderDetail = productIdentity.orderDetail[0];
        const sellingPrice =
          orderDetail.discountedPrice || orderDetail.originalPrice || 0;
        const importPrice =
          productIdentity.purchaseOrderDetail?.importPrice || 0;
        profitFromReturnedItems += sellingPrice - importPrice;
      }
    });

    // Lợi nhuận cuối cùng
    const totalProfit = totalProfitBeforeReturns - profitFromReturnedItems;

    const totalOrders = await this.prisma.order.count();

    return {
      totalCustomers,
      totalProductsSold,
      totalPurchaseAmount,
      totalSellingPrice,
      totalReturnAmount,
      totalProfit,
      totalOrders,
    };
  }
}
