import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductIdentitiesService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy danh sách tất cả các product identity với bộ lọc
  async findAll(sold?: string) {
    const isSoldFilter =
      sold === 'true' ? true : sold === 'false' ? false : undefined;

    const productIdentities = await this.prisma.productIdentity.findMany({
      where: {
        isSold: isSoldFilter,
      },
      include: {
        product: {
          include: { model: { include: { brand: true } } },
        },
        color: true,
        purchaseOrderDetail: {
          select: { importPrice: true },
        },
        returns: {
          select: { status: true, returnDate: true, reason: true },
          orderBy: { createdAt: 'desc' }, // Lấy bản ghi mới nhất
        },
        returnTicket: {
          select: { status: true, startDate: true, endDate: true },
          orderBy: { createdAt: 'desc' }, // Lấy bản ghi mới nhất
        },
        orderDetail: {
          select: { orderId: true, returnStatus: true },
          orderBy: { createdAt: 'desc' }, // Lấy bản ghi mới nhất
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate summary statistics
    const totalProducts = await this.prisma.productIdentity.count();
    const soldProducts = await this.prisma.productIdentity.count({
      where: { isSold: true },
    });
    const unsoldProducts = await this.prisma.productIdentity.count({
      where: { isSold: false },
    });

    const detailedData = productIdentities.map(pi => {
      const latestReturn = pi.returns.length > 0 ? pi.returns[0] : null;
      const latestReturnTicket =
        pi.returnTicket.length > 0 ? pi.returnTicket[0] : null;
      const latestOrderDetail =
        pi.orderDetail.length > 0 ? pi.orderDetail[0] : null;

      return {
        id: pi.id,
        imei: pi.imei,
        productId: pi.productId,
        productName: pi.product?.name ?? 'Unknown Product',
        brand: pi.product?.model?.brand?.name ?? 'Unknown Brand',
        model: pi.product?.model?.name ?? 'Unknown Model',
        colorId: pi.colorId,
        colorName: pi.color?.name ?? 'Unknown Color',
        isSold: pi.isSold,
        importPrice: pi.purchaseOrderDetail?.importPrice ?? 0,
        warrantyStartDate: pi.warrantyStartDate, // Directly from ProductIdentity
        warrantyEndDate: pi.warrantyEndDate, // Directly from ProductIdentity
        returnStatus: latestReturn?.status ?? null,
        returnDate: latestReturn?.returnDate ?? null,
        returnReason: latestReturn?.reason ?? null,
        returnTicketStatus: latestReturnTicket?.status ?? null,
        orderId: latestOrderDetail?.orderId ?? null,
        orderReturnStatus: latestOrderDetail?.returnStatus ?? null,
      };
    });

    return {
      message: 'Lấy danh sách product identity thành công',
      data: detailedData,
      summary: {
        totalProducts,
        soldProducts,
        unsoldProducts,
      },
    };
  }
}
