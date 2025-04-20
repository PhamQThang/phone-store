import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getInventoryStats() {
    // Lấy danh sách ProductIdentity chưa bán (isSold: false), nhóm theo productId và colorId
    const inventoryStats = await this.prisma.productIdentity.groupBy({
      by: ['productId', 'colorId'],
      where: {
        isSold: false, // Chỉ lấy sản phẩm chưa bán
      },
      _count: {
        id: true, // Đếm số lượng
      },
    });

    // Lấy thông tin chi tiết của sản phẩm và màu sắc
    const detailedStats = await Promise.all(
      inventoryStats.map(async stat => {
        const product = await this.prisma.product.findUnique({
          where: { id: stat.productId },
          include: {
            model: {
              include: { brand: true },
            },
          },
        });

        const color = await this.prisma.color.findUnique({
          where: { id: stat.colorId },
        });

        return {
          productId: stat.productId,
          productName: product?.name,
          brand: product?.model?.brand?.name,
          model: product?.model?.name,
          colorId: stat.colorId,
          colorName: color?.name,
          stockQuantity: stat._count.id, // Số lượng tồn kho
        };
      })
    );

    return {
      message: 'Thống kê số lượng sản phẩm tồn kho thành công',
      data: detailedStats,
    };
  }

  async getRevenueStats() {
    // Lấy tất cả các đơn hàng đã giao thành công (status: 'Delivered')
    const deliveredOrders = await this.prisma.order.findMany({
      where: {
        status: 'Delivered',
      },
      include: {
        orderDetails: {
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
                purchaseOrderDetail: true, // Lấy giá nhập
              },
            },
          },
        },
      },
    });

    // Tính toán doanh thu và lợi nhuận
    let totalRevenue = 0;
    let totalProfit = 0;

    const detailedStats = deliveredOrders.flatMap(order =>
      order.orderDetails.map(detail => {
        const sellingPrice = detail.price || 0; // Giá bán từ OrderDetail.price
        const importPrice =
          detail.productIdentity?.purchaseOrderDetail?.importPrice || 0; // Giá nhập
        const profit = sellingPrice - importPrice; // Lợi nhuận cho sản phẩm này

        totalRevenue += sellingPrice;
        totalProfit += profit;

        return {
          orderId: order.id,
          productId: detail.productId,
          productName: detail.product.name,
          brand: detail.product.model?.brand?.name,
          model: detail.product.model?.name,
          colorId: detail.colorId,
          colorName: detail.color.name,
          imei: detail.productIdentity?.imei,
          importPrice: importPrice,
          sellingPrice: sellingPrice,
          profit: profit,
        };
      })
    );

    return {
      message: 'Thống kê doanh thu và lợi nhuận thành công',
      data: {
        totalRevenue: totalRevenue,
        totalProfit: totalProfit,
        details: detailedStats,
      },
    };
  }
}
