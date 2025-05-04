import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getInventoryStats() {
    const inventoryStats = await this.prisma.productIdentity.groupBy({
      by: ['productId', 'colorId'],
      where: {
        isSold: false,
      },
      _count: {
        id: true,
      },
    });

    const productIds = inventoryStats.map(stat => stat.productId);
    const colorIds = inventoryStats.map(stat => stat.colorId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        model: {
          include: { brand: true },
        },
      },
    });

    const colors = await this.prisma.color.findMany({
      where: { id: { in: colorIds } },
    });

    const detailedStats = await Promise.all(
      inventoryStats.map(async stat => {
        const productIdentities = await this.prisma.productIdentity.findMany({
          where: {
            productId: stat.productId,
            colorId: stat.colorId,
            isSold: false,
          },
          select: {
            id: true,
            imei: true,
            warrantyStartDate: true,
            warrantyEndDate: true,
          },
        });

        const product = products.find(p => p.id === stat.productId);
        const color = colors.find(c => c.id === stat.colorId);

        return {
          productId: stat.productId,
          productName: product?.name ?? 'Unknown Product',
          brand: product?.model?.brand?.name ?? 'Unknown Brand',
          model: product?.model?.name ?? 'Unknown Model',
          colorId: stat.colorId,
          colorName: color?.name ?? 'Unknown Color',
          stockQuantity: stat._count.id,
          productIdentities: productIdentities,
        };
      })
    );

    return {
      message: 'Thống kê số lượng sản phẩm tồn kho thành công',
      data: detailedStats,
    };
  }

  async getRevenueStats() {
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
            product: {
              include: {
                model: {
                  include: { brand: true },
                },
              },
            },
            color: true,
            productIdentity: {
              include: {
                purchaseOrderDetail: true,
              },
            },
          },
        },
      },
    });

    let totalRevenue = 0;
    let totalImportPrice = 0;
    let totalSellingPrice = 0;
    let totalProfit = 0;

    const detailedStats = deliveredOrders.flatMap(order =>
      order.orderDetails.map(detail => {
        const sellingPrice =
          detail.discountedPrice || detail.originalPrice || 0;
        const importPrice =
          detail.productIdentity?.purchaseOrderDetail?.importPrice || 0;
        const profit = sellingPrice - importPrice;

        totalRevenue += sellingPrice;
        totalImportPrice += importPrice;
        totalSellingPrice += sellingPrice;
        totalProfit += profit;

        return {
          orderId: order.id,
          productId: detail.productId,
          productName: detail.product.name,
          brand: detail.product.model?.brand?.name ?? 'Unknown Brand',
          model: detail.product.model?.name ?? 'Unknown Model',
          colorId: detail.colorId,
          colorName: detail.color.name,
          imei: detail.productIdentity?.imei,
          importPrice,
          sellingPrice,
          profit,
        };
      })
    );

    return {
      message: 'Thống kê doanh thu, giá nhập, giá bán và lợi nhuận thành công',
      data: {
        summary: {
          totalRevenue,
          totalImportPrice,
          totalSellingPrice,
          totalProfit,
        },
        details: detailedStats,
      },
    };
  }

  async getMonthlyRevenueStats(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const deliveredOrders = await this.prisma.order.findMany({
      where: {
        status: 'Delivered',
        createdAt: {
          gte: startDate,
          lt: endDate,
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

    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
      importPrice: 0,
      sellingPrice: 0,
      profit: 0,
      orderCount: 0,
    }));

    deliveredOrders.forEach(order => {
      const month = order.createdAt.getMonth();
      let orderRevenue = 0;
      let orderImportPrice = 0;
      let orderSellingPrice = 0;
      let orderProfit = 0;

      order.orderDetails.forEach(detail => {
        const sellingPrice =
          detail.discountedPrice || detail.originalPrice || 0;
        const importPrice =
          detail.productIdentity?.purchaseOrderDetail?.importPrice || 0;
        const profit = sellingPrice - importPrice;

        orderRevenue += sellingPrice;
        orderImportPrice += importPrice;
        orderSellingPrice += sellingPrice;
        orderProfit += profit;
      });

      if (order.orderDetails.length > 0) {
        monthlyStats[month].revenue += orderRevenue;
        monthlyStats[month].importPrice += orderImportPrice;
        monthlyStats[month].sellingPrice += orderSellingPrice;
        monthlyStats[month].profit += orderProfit;
        monthlyStats[month].orderCount += 1;
      }
    });

    return {
      message: `Thống kê doanh thu, giá nhập, giá bán theo tháng trong năm ${year} thành công`,
      data: monthlyStats,
    };
  }

  async getUserStats() {
    const userCount = await this.prisma.user.count();
    return {
      message: 'Thống kê số lượng người dùng thành công',
      data: {
        totalUsers: userCount,
      },
    };
  }
}
