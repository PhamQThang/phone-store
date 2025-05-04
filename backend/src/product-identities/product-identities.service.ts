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
        },
        returns: {
          select: { status: true, returnDate: true, reason: true },
        },
        returnTicket: {
          select: { status: true, startDate: true, endDate: true },
        },
        orderDetail: {
          select: { orderId: true, returnStatus: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const detailedData = productIdentities.map(pi => ({
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
      warrantyStatus: pi.warranties.length > 0 ? pi.warranties[0].status : null,
      warrantyStartDate:
        pi.warranties.length > 0 ? pi.warranties[0].startDate : null,
      warrantyEndDate:
        pi.warranties.length > 0 ? pi.warranties[0].endDate : null,
      returnStatus: pi.returns.length > 0 ? pi.returns[0].status : null,
      returnDate: pi.returns.length > 0 ? pi.returns[0].returnDate : null,
      returnReason: pi.returns.length > 0 ? pi.returns[0].reason : null,
      returnTicketStatus:
        pi.returnTicket.length > 0 ? pi.returnTicket[0].status : null,
      orderId: pi.orderDetail.length > 0 ? pi.orderDetail[0].orderId : null,
      orderReturnStatus:
        pi.orderDetail.length > 0 ? pi.orderDetail[0].returnStatus : null,
    }));

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
        },
        returns: {
          select: { status: true, returnDate: true, reason: true },
        },
        returnTicket: {
          select: { status: true, startDate: true, endDate: true },
        },
        orderDetail: {
          select: { orderId: true, returnStatus: true },
        },
      },
    });

    if (!productIdentity) {
      throw new NotFoundException('Product identity không tồn tại');
    }

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
      warrantyStatus:
        productIdentity.warranties.length > 0
          ? productIdentity.warranties[0].status
          : null,
      warrantyStartDate:
        productIdentity.warranties.length > 0
          ? productIdentity.warranties[0].startDate
          : null,
      warrantyEndDate:
        productIdentity.warranties.length > 0
          ? productIdentity.warranties[0].endDate
          : null,
      returnStatus:
        productIdentity.returns.length > 0
          ? productIdentity.returns[0].status
          : null,
      returnDate:
        productIdentity.returns.length > 0
          ? productIdentity.returns[0].returnDate
          : null,
      returnReason:
        productIdentity.returns.length > 0
          ? productIdentity.returns[0].reason
          : null,
      returnTicketStatus:
        productIdentity.returnTicket.length > 0
          ? productIdentity.returnTicket[0].status
          : null,
      orderId:
        productIdentity.orderDetail.length > 0
          ? productIdentity.orderDetail[0].orderId
          : null,
      orderReturnStatus:
        productIdentity.orderDetail.length > 0
          ? productIdentity.orderDetail[0].returnStatus
          : null,
    };

    return {
      message: 'Lấy thông tin product identity thành công',
      data: detailedData,
    };
  }
}
