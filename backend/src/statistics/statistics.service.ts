import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface OrderDetailStat {
  orderId: string;
  productId: string;
  productName: string;
  importPrice: number;
  sellingPrice: number;
  profit: number;
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
  orders: OrderDetailStat[];
}

export interface StoreSummaryStats {
  totalProducts: number;
  totalProductsSold: number;
  totalPurchaseAmount: number;
  totalSellingPrice: number;
  totalProfit: number;
  totalOrders: number;
}

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrderStats(startDate: string, endDate: string) {
    // Kiểm tra và định dạng ngày
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

    // Đặt thời gian cho start và end
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Tính số ngày trong khoảng thời gian (bao gồm cả ngày bắt đầu và kết thúc)
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Lấy tất cả đơn nhập hàng và đơn hàng
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: 'Done',
      },
      select: {
        createdAt: true,
        totalCost: true,
      },
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
        orderDetails: {
          where: {
            returnStatus: false,
          },
        },
      },
    });

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
          where: {
            returnStatus: false,
          },
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

    // Tạo mảng thống kê cho từng ngày
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
        orders: [],
      });
    }

    // Hàm để lấy ngày (bỏ qua giờ) trong cùng timezone
    const getNormalizedDate = (date: Date): Date => {
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0); // Đặt về đầu ngày
      return normalized;
    };

    // Tính tổng số tiền nhập hàng hàng ngày
    purchaseOrders.forEach(order => {
      const orderDate = getNormalizedDate(order.createdAt);
      const dayIndex = Math.floor(
        (orderDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      dailyStats[dayIndex].totalPurchaseAmount += order.totalCost || 0;
    });

    // Tính số đơn hàng và số sản phẩm bán hàng ngày
    allOrders.forEach(order => {
      const orderDate = getNormalizedDate(order.createdAt);
      const dayIndex = Math.floor(
        (orderDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      dailyStats[dayIndex].totalOrders += 1;

      if (order.status === 'Delivered') {
        dailyStats[dayIndex].totalDelivered += 1;
      } else if (['Pending', 'Confirmed', 'Shipping'].includes(order.status)) {
        dailyStats[dayIndex].totalProcessing += 1;
      } else if (order.status === 'Canceled') {
        dailyStats[dayIndex].totalCancelled += 1;
      }

      if (order.status === 'Delivered') {
        dailyStats[dayIndex].totalProductsSold += order.orderDetails.length;
      }
    });

    // Tính giá bán, giá nhập, lợi nhuận từ các đơn Delivered
    deliveredOrders.forEach(order => {
      const orderDate = getNormalizedDate(order.createdAt);
      const dayIndex = Math.floor(
        (orderDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );

      order.orderDetails.forEach(detail => {
        const sellingPrice =
          detail.discountedPrice || detail.originalPrice || 0;
        const importPrice =
          detail.productIdentity?.purchaseOrderDetail?.importPrice || 0;
        const profit = sellingPrice - importPrice;

        dailyStats[dayIndex].totalSellingPrice += sellingPrice;
        dailyStats[dayIndex].totalProfit += profit;

        dailyStats[dayIndex].orders.push({
          orderId: order.id,
          productId: detail.productId,
          productName: detail.product.name,
          importPrice,
          sellingPrice,
          profit,
        });
      });
    });

    return {
      message: `Thống kê đơn hàng và nhập hàng từ ${start.toLocaleDateString('vi-VN')} đến ${end.toLocaleDateString('vi-VN')} thành công`,
      data: dailyStats,
    };
  }

  async getDailyProfitStats(date?: string) {
    const today = date ? new Date(date) : new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const deliveredOrders = await this.prisma.order.findMany({
      where: {
        status: 'Delivered',
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        orderDetails: {
          where: {
            returnStatus: false,
          },
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

    let totalProfit = 0;
    const detailedStats = deliveredOrders.flatMap(order =>
      order.orderDetails.map(detail => {
        const sellingPrice =
          detail.discountedPrice || detail.originalPrice || 0;
        const importPrice =
          detail.productIdentity?.purchaseOrderDetail?.importPrice || 0;
        const profit = sellingPrice - importPrice;

        totalProfit += profit;

        return {
          orderId: order.id,
          productId: detail.productId,
          productName: detail.product.name,
          importPrice,
          sellingPrice,
          profit,
        };
      })
    );

    return {
      message: `Thống kê lợi nhuận trong ngày ${today.toLocaleDateString('vi-VN')} thành công`,
      data: {
        summary: {
          totalProfit,
        },
        details: detailedStats,
      },
    };
  }

  async getStoreSummaryStats(): Promise<StoreSummaryStats> {
    // Tổng số lượng sản phẩm (tất cả ProductIdentity)
    const totalProducts = await this.prisma.productIdentity.count();

    // Tổng số lượng sản phẩm đã bán (ProductIdentity với isSold = true)
    const totalProductsSold = await this.prisma.productIdentity.count({
      where: {
        isSold: true,
      },
    });

    // Tổng số tiền đã nhập hàng (từ PurchaseOrder với status = 'Done')
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      where: {
        status: 'Done',
      },
      select: {
        totalCost: true,
      },
    });
    const totalPurchaseAmount = purchaseOrders.reduce(
      (sum, order) => sum + (order.totalCost || 0),
      0
    );

    // Tổng số tiền đã bán, tổng lợi nhuận (từ Order với status = 'Delivered')
    const deliveredOrders = await this.prisma.order.findMany({
      where: {
        status: 'Delivered',
      },
      include: {
        orderDetails: {
          where: {
            returnStatus: false,
          },
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
    let totalProfit = 0;
    deliveredOrders.forEach(order => {
      order.orderDetails.forEach(detail => {
        const sellingPrice =
          detail.discountedPrice || detail.originalPrice || 0;
        const importPrice =
          detail.productIdentity?.purchaseOrderDetail?.importPrice || 0;
        const profit = sellingPrice - importPrice;

        totalSellingPrice += sellingPrice;
        totalProfit += profit;
      });
    });

    // Tổng số đơn hàng
    const totalOrders = await this.prisma.order.count();

    return {
      totalProducts,
      totalProductsSold,
      totalPurchaseAmount,
      totalSellingPrice,
      totalProfit,
      totalOrders,
    };
  }
}
