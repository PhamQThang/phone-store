import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarrantyRequestDto } from './dto/warranty-request.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WarrantyService {
  constructor(private readonly prisma: PrismaService) {}

  async createWarrantyRequest(
    userId: number,
    createWarrantyRequestDto: CreateWarrantyRequestDto
  ) {
    const { productIdentityId, reason, fullName, phoneNumber, email } =
      createWarrantyRequestDto;

    // Kiểm tra productIdentity
    const productIdentity = await this.prisma.productIdentity.findUnique({
      where: { id: productIdentityId },
      include: {
        product: true,
        orderDetail: { include: { order: true } },
      },
    });

    if (!productIdentity) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    if (!productIdentity.isSold) {
      throw new BadRequestException('Sản phẩm này chưa được bán');
    }

    // Kiểm tra quyền sở hữu: productIdentity chỉ liên kết với 1 OrderDetail
    const orderDetail = productIdentity.orderDetail[0]; // Lấy OrderDetail đầu tiên
    if (!orderDetail || orderDetail.order.userId !== userId) {
      throw new BadRequestException(
        'Bạn không có quyền yêu cầu bảo hành cho sản phẩm này'
      );
    }

    // Kiểm tra thời hạn bảo hành
    const currentDate = new Date();
    if (
      productIdentity.warrantyEndDate &&
      currentDate > productIdentity.warrantyEndDate
    ) {
      throw new BadRequestException('Sản phẩm đã hết thời hạn bảo hành');
    }

    // Kiểm tra xem sản phẩm đã có yêu cầu bảo hành nào đang xử lý chưa
    const existingRequest = await this.prisma.warrantyRequest.findFirst({
      where: {
        productIdentityId,
        status: { in: ['Pending', 'Approved'] },
      },
    });

    if (existingRequest) {
      throw new BadRequestException(
        'Sản phẩm này đã có yêu cầu bảo hành đang xử lý'
      );
    }

    // Tạo yêu cầu bảo hành
    const warrantyRequest = await this.prisma.warrantyRequest.create({
      data: {
        userId,
        productIdentityId,
        reason,
        fullName,
        phoneNumber,
        email,
        status: 'Pending',
      },
      include: {
        user: { select: { id: true, fullName: true } },
        productIdentity: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    });

    return {
      message: 'Tạo yêu cầu bảo hành thành công',
      data: warrantyRequest,
    };
  }

  async updateWarrantyRequestStatus(
    requestId: string,
    requesterId: number,
    newStatus: string
  ) {
    const validStatuses = [
      'Pending',
      'Approved',
      'Rejected',
      'Completed',
      'Canceled',
    ] as const;
    if (!validStatuses.includes(newStatus as any)) {
      throw new BadRequestException('Trạng thái không hợp lệ');
    }

    // Kiểm tra quyền của người yêu cầu
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
    if (!isAdminOrEmployee) {
      throw new BadRequestException(
        'Bạn không có quyền cập nhật trạng thái yêu cầu bảo hành'
      );
    }

    // Kiểm tra yêu cầu bảo hành
    const warrantyRequest = await this.prisma.warrantyRequest.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { id: true, fullName: true } },
        productIdentity: {
          include: {
            product: {
              select: { id: true, name: true, warrantyPeriod: true },
            },
          },
        },
      },
    });

    if (!warrantyRequest) {
      throw new NotFoundException('Yêu cầu bảo hành không tồn tại');
    }

    // Kiểm tra chuyển đổi trạng thái hợp lệ
    const validTransitions: { [key: string]: string[] } = {
      Pending: ['Approved', 'Rejected', 'Canceled'],
      Approved: ['Completed', 'Canceled'],
      Rejected: [],
      Completed: [],
      Canceled: [],
    };

    if (!validTransitions[warrantyRequest.status].includes(newStatus)) {
      throw new BadRequestException(
        `Không thể chuyển từ trạng thái ${warrantyRequest.status} sang ${newStatus}`
      );
    }

    // Cập nhật trạng thái trong giao dịch
    const updatedRequest = await this.prisma.$transaction(async tx => {
      let updatedWarrantyRequest;

      if (newStatus === 'Approved') {
        // Kiểm tra xem đã có phiếu bảo hành nào cho sản phẩm này chưa
        const existingWarranty = await tx.warranty.findFirst({
          where: {
            productIdentityId: warrantyRequest.productIdentityId,
            status: { not: 'Canceled' },
          },
        });

        if (existingWarranty) {
          throw new BadRequestException(
            'Sản phẩm này đã có phiếu bảo hành đang hoạt động'
          );
        }

        // Tăng số lần bảo hành của ProductIdentity
        await tx.productIdentity.update({
          where: { id: warrantyRequest.productIdentityId },
          data: {
            warrantyCount: { increment: 1 }, // Tăng warrantyCount lên 1
          },
        });

        // Sử dụng thời hạn bảo hành từ ProductIdentity thay vì tạo mới
        const productIdentity = await tx.productIdentity.findUnique({
          where: { id: warrantyRequest.productIdentityId },
        });

        if (
          !productIdentity?.warrantyStartDate ||
          !productIdentity?.warrantyEndDate
        ) {
          throw new BadRequestException(
            'Sản phẩm này không có thời hạn bảo hành hợp lệ'
          );
        }

        // Tạo phiếu bảo hành mới với trạng thái ban đầu là "Requested" và lưu warrantyRequestId
        await tx.warranty.create({
          data: {
            userId: warrantyRequest.userId,
            productIdentityId: warrantyRequest.productIdentityId,
            startDate: productIdentity.warrantyStartDate, // Sử dụng ngày bắt đầu từ ProductIdentity
            endDate: productIdentity.warrantyEndDate, // Sử dụng ngày kết thúc từ ProductIdentity
            status: 'Requested', // Trạng thái ban đầu: Đã tiếp nhận
            note: warrantyRequest.reason, // Sử dụng lý do từ yêu cầu bảo hành
            warrantyRequestId: requestId, // Lưu ID của warrantyRequest
          },
        });

        // Cập nhật trạng thái yêu cầu bảo hành thành "Completed"
        updatedWarrantyRequest = await tx.warrantyRequest.update({
          where: { id: requestId },
          data: { status: 'Completed' },
          include: {
            user: { select: { id: true, fullName: true } },
            productIdentity: {
              include: { product: { select: { id: true, name: true } } },
            },
          },
        });
      } else {
        // Nếu trạng thái là "Rejected" hoặc "Canceled", chỉ cập nhật trạng thái yêu cầu bảo hành
        updatedWarrantyRequest = await tx.warrantyRequest.update({
          where: { id: requestId },
          data: { status: newStatus as any },
          include: {
            user: { select: { id: true, fullName: true } },
            productIdentity: {
              include: { product: { select: { id: true, name: true } } },
            },
          },
        });
      }

      return updatedWarrantyRequest;
    });

    return {
      message: 'Cập nhật trạng thái yêu cầu bảo hành thành công',
      data: updatedRequest,
    };
  }

  async getWarrantyRequests(requesterId: number) {
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

    const warrantyRequests = await this.prisma.warrantyRequest.findMany({
      where: isAdminOrEmployee ? {} : { userId: requesterId },
      include: {
        user: { select: { id: true, fullName: true } },
        productIdentity: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
      orderBy: { requestDate: 'desc' },
    });

    return {
      message: 'Lấy danh sách yêu cầu bảo hành thành công',
      data: warrantyRequests,
    };
  }

  async getWarrantyRequestDetails(requestId: string, requesterId: number) {
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      include: { role: true },
    });

    if (!requester) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const warrantyRequest = await this.prisma.warrantyRequest.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { id: true, fullName: true } },
        productIdentity: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
    });

    if (!warrantyRequest) {
      throw new NotFoundException('Yêu cầu bảo hành không tồn tại');
    }

    const isAdminOrEmployee = ['Admin', 'Employee'].includes(
      requester.role.name
    );
    const isRequestOwner = warrantyRequest.userId === requesterId;

    if (!isAdminOrEmployee && !isRequestOwner) {
      throw new BadRequestException(
        'Bạn không có quyền xem yêu cầu bảo hành này'
      );
    }

    return {
      message: 'Lấy chi tiết yêu cầu bảo hành thành công',
      data: warrantyRequest,
    };
  }

  async getWarranties(requesterId: number) {
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

    const warranties = await this.prisma.warranty.findMany({
      where: isAdminOrEmployee ? {} : { userId: requesterId },
      include: {
        user: { select: { id: true, fullName: true } },
        productIdentity: {
          include: {
            product: { select: { id: true, name: true } },
            color: { select: { id: true, name: true } },
          },
        },
        warrantyRequest: {
          include: {
            user: { select: { id: true, fullName: true } },
            productIdentity: {
              include: { product: { select: { id: true, name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Lấy danh sách phiếu bảo hành thành công',
      data: warranties,
    };
  }

  async getWarrantyDetails(warrantyId: string, requesterId: number) {
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      include: { role: true },
    });

    if (!requester) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const warranty = await this.prisma.warranty.findUnique({
      where: { id: warrantyId },
      include: {
        user: { select: { id: true, fullName: true } },
        productIdentity: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                productFiles: {
                  include: {
                    file: { select: { url: true } },
                  },
                  where: { isMain: true },
                  take: 1,
                },
              },
            },
            color: { select: { id: true, name: true } },
            orderDetail: {
              include: {
                order: { select: { id: true, createdAt: true } },
              },
            },
          },
        },
        warrantyRequest: {
          include: {
            user: { select: { id: true, fullName: true } },
            productIdentity: {
              include: { product: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    if (!warranty) {
      throw new NotFoundException('Phiếu bảo hành không tồn tại');
    }

    const isAdminOrEmployee = ['Admin', 'Employee'].includes(
      requester.role.name
    );
    const isWarrantyOwner = warranty.userId === requesterId;

    if (!isAdminOrEmployee && !isWarrantyOwner) {
      throw new BadRequestException(
        'Bạn không có quyền xem phiếu bảo hành này'
      );
    }

    const mainImage =
      warranty.productIdentity?.product?.productFiles?.[0]?.file?.url || null;

    return {
      message: 'Lấy chi tiết phiếu bảo hành thành công',
      data: {
        ...warranty,
        productIdentity: {
          ...warranty.productIdentity,
          product: {
            ...warranty.productIdentity?.product,
            imageUrl: mainImage,
          },
        },
      },
    };
  }

  async updateWarrantyStatus(
    warrantyId: string,
    requesterId: number,
    newStatus: string
  ) {
    const validStatuses = [
      'Requested',
      'Processing',
      'Repairing',
      'Repaired',
      'Returned',
      'Canceled',
    ] as const;
    if (!validStatuses.includes(newStatus as any)) {
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
    if (!isAdminOrEmployee) {
      throw new BadRequestException(
        'Bạn không có quyền cập nhật trạng thái phiếu bảo hành'
      );
    }

    const warranty = await this.prisma.warranty.findUnique({
      where: { id: warrantyId },
      include: {
        user: { select: { id: true, fullName: true } },
        productIdentity: {
          include: {
            product: { select: { id: true, name: true } },
            color: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!warranty) {
      throw new NotFoundException('Phiếu bảo hành không tồn tại');
    }

    const validTransitions: { [key: string]: string[] } = {
      Requested: ['Processing', 'Canceled'],
      Processing: ['Repairing', 'Canceled'],
      Repairing: ['Repaired', 'Canceled'],
      Repaired: ['Returned', 'Canceled'],
      Returned: [],
      Canceled: [],
    };

    if (!validTransitions[warranty.status].includes(newStatus)) {
      throw new BadRequestException(
        `Không thể chuyển từ trạng thái ${warranty.status} sang ${newStatus}`
      );
    }

    const updatedWarranty = await this.prisma.warranty.update({
      where: { id: warrantyId },
      data: { status: newStatus as any },
      include: {
        user: { select: { id: true, fullName: true } },
        productIdentity: {
          include: {
            product: { select: { id: true, name: true } },
            color: { select: { id: true, name: true } },
          },
        },
      },
    });

    return {
      message: 'Cập nhật trạng thái phiếu bảo hành thành công',
      data: updatedWarranty,
    };
  }
}
