import { Injectable, NotFoundException } from '@nestjs/common';
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
        warranties: {
          select: { status: true, startDate: true, endDate: true },
          orderBy: { createdAt: 'desc' }, // Lấy bản ghi mới nhất
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

    const detailedData = productIdentities.map(pi => {
      const latestWarranty = pi.warranties.length > 0 ? pi.warranties[0] : null;
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
        warrantyStatus: latestWarranty?.status ?? null,
        warrantyStartDate: latestWarranty?.startDate ?? null,
        warrantyEndDate: latestWarranty?.endDate ?? null,
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
    };
  }

  // Lấy thông tin chi tiết của một product identity theo ID
  async findOne(id: string) {
    const productIdentity = await this.prisma.productIdentity.findUnique({
      where: { id },
      include: {
        product: {
          include: { model: { include: { brand: true } } },
        },
        color: true,
        purchaseOrderDetail: {
          select: { importPrice: true },
        },
        warranties: {
          select: { status: true, startDate: true, endDate: true },
          orderBy: { createdAt: 'desc' }, // Lấy bản ghi mới nhất
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
    });

    if (!productIdentity) {
      throw new NotFoundException('Product identity không tồn tại');
    }

    const latestWarranty =
      productIdentity.warranties.length > 0
        ? productIdentity.warranties[0]
        : null;
    const latestReturn =
      productIdentity.returns.length > 0 ? productIdentity.returns[0] : null;
    const latestReturnTicket =
      productIdentity.returnTicket.length > 0
        ? productIdentity.returnTicket[0]
        : null;
    const latestOrderDetail =
      productIdentity.orderDetail.length > 0
        ? productIdentity.orderDetail[0]
        : null;

    const detailedData = {
      id: productIdentity.id,
      imei: productIdentity.imei,
      productId: productIdentity.productId,
      productName: productIdentity.product?.name ?? 'Unknown Product',
      brand: productIdentity.product?.model?.brand?.name ?? 'Unknown Brand',
      model: productIdentity.product?.model?.name ?? 'Unknown Model',
      colorId: productIdentity.colorId,
      colorName: productIdentity.color?.name ?? 'Unknown Color',
      isSold: productIdentity.isSold,
      importPrice: productIdentity.purchaseOrderDetail?.importPrice ?? 0,
      warrantyStatus: latestWarranty?.status ?? null,
      warrantyStartDate: latestWarranty?.startDate ?? null,
      warrantyEndDate: latestWarranty?.endDate ?? null,
      returnStatus: latestReturn?.status ?? null,
      returnDate: latestReturn?.returnDate ?? null,
      returnReason: latestReturn?.reason ?? null,
      returnTicketStatus: latestReturnTicket?.status ?? null,
      orderId: latestOrderDetail?.orderId ?? null,
      orderReturnStatus: latestOrderDetail?.returnStatus ?? null,
    };

    return {
      message: 'Lấy thông tin product identity thành công',
      data: detailedData,
    };
  }
}
