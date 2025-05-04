import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, return_status, returnticket_status } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { CreateReturnDto } from './dto/returns.dto';

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReturn(userId: number, createReturnDto: CreateReturnDto) {
    const { productIdentityId, reason, fullName, phoneNumber, address } =
      createReturnDto;

    const productIdentity = await this.prisma.productIdentity.findUnique({
      where: { id: productIdentityId },
      include: {
        product: {
          include: {
            productFiles: {
              where: { isMain: true },
              include: { file: true },
            },
          },
        },
        orderDetail: {
          include: {
            order: true,
          },
        },
        color: true,
      },
    });

    if (!productIdentity) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    if (!productIdentity.isSold) {
      throw new BadRequestException('Sản phẩm này chưa được bán');
    }

    const orderDetail = productIdentity.orderDetail?.[0];
    if (!orderDetail || orderDetail.order.userId !== userId) {
      throw new BadRequestException(
        'Bạn không có quyền yêu cầu đổi trả cho sản phẩm này'
      );
    }

    if (orderDetail.order.status !== 'Delivered') {
      throw new BadRequestException(
        'Đơn hàng chưa được giao, không thể yêu cầu đổi trả'
      );
    }

    const deliveredDate = orderDetail.order.updatedAt;
    const currentDate = new Date();
    const daysSinceDelivered = Math.floor(
      (currentDate.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const returnWindowDays = parseInt(process.env.RETURN_WINDOW_DAYS) || 7;

    if (daysSinceDelivered > returnWindowDays) {
      throw new BadRequestException(
        `Đã quá ${returnWindowDays} ngày kể từ ngày giao hàng. Vui lòng sử dụng chính sách bảo hành.`
      );
    }

    const existingReturn = await this.prisma.productReturn.findFirst({
      where: {
        productIdentityId,
        status: { in: ['Pending', 'Approved'] },
      },
    });
    if (existingReturn) {
      throw new BadRequestException(
        'Sản phẩm này đã có yêu cầu đổi trả đang xử lý'
      );
    }

    const existingWarrantyRequests = await this.prisma.warrantyRequest.findMany(
      {
        where: {
          productIdentityId,
          status: { in: ['Pending', 'Approved'] },
        },
        include: {
          warranty: true,
        },
      }
    );

    const hasActiveWarranty = existingWarrantyRequests.some(request =>
      request.warranty.some(
        warranty => !['Returned', 'Canceled'].includes(warranty.status)
      )
    );

    if (hasActiveWarranty) {
      throw new BadRequestException(
        'Sản phẩm này đang có yêu cầu bảo hành đang xử lý'
      );
    }

    const productReturn = await this.prisma.productReturn.create({
      data: {
        id: uuidv4(),
        user: { connect: { id: userId } },
        productIdentity: { connect: { id: productIdentityId } },
        reason,
        status: 'Pending',
        returnDate: new Date(),
        fullName,
        phoneNumber,
        address,
      },
      include: {
        user: { select: { id: true, fullName: true } },
        productIdentity: {
          include: {
            product: {
              include: {
                productFiles: {
                  where: { isMain: true },
                  include: { file: true },
                },
              },
            },
            color: { select: { id: true, name: true } },
          },
        },
      },
    });

    const mainImage =
      productReturn.productIdentity?.product?.productFiles?.[0]?.file?.url ||
      null;

    return {
      message: 'Tạo yêu cầu đổi trả thành công',
      data: {
        ...productReturn,
        productIdentity: {
          ...productReturn.productIdentity,
          product: {
            ...productReturn.productIdentity.product,
            imageUrl: mainImage,
          },
        },
      },
    };
  }

  async updateReturnStatus(
    returnId: string,
    requesterId: number,
    newStatus: return_status
  ) {
    const validStatuses: return_status[] = [
      'Pending',
      'Approved',
      'Rejected',
      'Completed',
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
    if (!isAdminOrEmployee) {
      throw new BadRequestException(
        'Bạn không có quyền cập nhật trạng thái yêu cầu đổi trả'
      );
    }

    const productReturn = await this.prisma.productReturn.findUnique({
      where: { id: returnId },
      include: {
        user: { select: { id: true, fullName: true } },
        productIdentity: {
          include: {
            product: {
              include: {
                productFiles: {
                  where: { isMain: true },
                  include: { file: true },
                },
              },
            },
            color: { select: { id: true, name: true } },
            orderDetail: {
              include: {
                order: {
                  select: {
                    id: true,
                    createdAt: true,
                    paymentMethod: true,
                    paymentStatus: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!productReturn) {
      throw new NotFoundException('Yêu cầu đổi trả không tồn tại');
    }

    const validTransitions: { [key in return_status]: return_status[] } = {
      Pending: ['Approved', 'Rejected'],
      Approved: ['Completed'],
      Rejected: [],
      Completed: [],
    };

    if (!validTransitions[productReturn.status].includes(newStatus)) {
      throw new BadRequestException(
        `Không thể chuyển từ trạng thái ${this.translateStatus(
          productReturn.status
        )} sang ${this.translateStatus(newStatus)}`
      );
    }

    try {
      let orderDetail;
      let existingReturnTicket;

      if (newStatus === 'Approved') {
        orderDetail = productReturn.productIdentity.orderDetail?.[0];
        if (!orderDetail) {
          throw new BadRequestException('Không tìm thấy chi tiết đơn hàng');
        }

        existingReturnTicket = await this.prisma.returnTicket.findFirst({
          where: {
            productIdentityId: productReturn.productIdentityId,
            status: { not: 'Canceled' },
          },
        });

        if (existingReturnTicket) {
          throw new BadRequestException(
            'Sản phẩm này đã có phiếu đổi trả đang hoạt động'
          );
        }
      }

      const updatedReturn = await this.prisma.$transaction(
        async tx => {
          const updated = await tx.productReturn.update({
            where: { id: returnId },
            data: { status: newStatus },
            include: {
              user: { select: { id: true, fullName: true } },
              productIdentity: {
                include: {
                  product: {
                    include: {
                      productFiles: {
                        where: { isMain: true },
                        include: { file: true },
                      },
                    },
                  },
                  color: { select: { id: true, name: true } },
                  orderDetail: {
                    include: {
                      order: {
                        select: {
                          id: true,
                          createdAt: true,
                          paymentMethod: true,
                          paymentStatus: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });

          if (newStatus === 'Approved') {
            const returnWindowDays =
              parseInt(process.env.RETURN_WINDOW_DAYS) || 7;
            const startDate = orderDetail.order.createdAt;
            if (!startDate) {
              throw new BadRequestException('Ngày tạo đơn hàng không hợp lệ');
            }

            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + returnWindowDays);

            const paymentStatus = 'Pending';

            await tx.returnTicket.create({
              data: {
                id: uuidv4(),
                user: { connect: { id: updated.userId } },
                productIdentity: { connect: { id: updated.productIdentityId } },
                startDate,
                endDate,
                status: 'Requested',
                note: updated.reason,
                productReturn: { connect: { id: returnId } },
                originalPrice: orderDetail.originalPrice,
                discountedPrice: orderDetail.discountedPrice,
                paymentMethod: orderDetail.order.paymentMethod,
                paymentStatus: paymentStatus,
                fullName: updated.fullName,
                phoneNumber: updated.phoneNumber,
                address: updated.address,
              },
            });
          }

          if (newStatus === 'Rejected') {
            const returnTicket = await tx.returnTicket.findFirst({
              where: {
                productIdentityId: productReturn.productIdentityId,
                productReturnId: returnId,
              },
            });

            if (returnTicket) {
              await tx.returnTicket.update({
                where: { id: returnTicket.id },
                data: { status: 'Canceled' },
              });
            }
          }

          const mainImage =
            updated.productIdentity?.product?.productFiles?.[0]?.file?.url ||
            null;

          return {
            ...updated,
            productIdentity: {
              ...updated.productIdentity,
              product: {
                ...updated.productIdentity.product,
                imageUrl: mainImage,
              },
            },
          };
        },
        {
          timeout: 10000,
        }
      );

      return {
        message: 'Cập nhật trạng thái yêu cầu đổi trả thành công',
        data: updatedReturn,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          `Lỗi khi cập nhật trạng thái: ${error.message} (Code: ${error.code})`
        );
      }
      throw new BadRequestException(
        `Lỗi không xác định khi cập nhật trạng thái: ${error.message || String(error)}`
      );
    }
  }

  async updateReturnTicketStatus(
    returnTicketId: string,
    requesterId: number,
    newStatus: returnticket_status
  ) {
    const validStatuses: returnticket_status[] = [
      'Requested',
      'Processing',
      'Processed',
      'Returned',
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
    if (!isAdminOrEmployee) {
      throw new BadRequestException(
        'Bạn không có quyền cập nhật trạng thái phiếu đổi trả'
      );
    }

    const returnTicket = await this.prisma.returnTicket.findUnique({
      where: { id: returnTicketId },
      include: {
        user: { select: { id: true, fullName: true } },
        productIdentity: {
          include: {
            product: { select: { id: true, name: true } },
            color: { select: { id: true, name: true } },
            orderDetail: {
              include: {
                order: true,
              },
            },
          },
        },
        productReturn: true,
      },
    });

    if (!returnTicket) {
      throw new NotFoundException('Phiếu đổi trả không tồn tại');
    }

    const validTransitions: {
      [key in returnticket_status]: returnticket_status[];
    } = {
      Requested: ['Processing', 'Canceled'],
      Processing: ['Processed', 'Canceled'],
      Processed: ['Returned', 'Canceled'],
      Returned: [],
      Canceled: [],
    };

    if (!validTransitions[returnTicket.status].includes(newStatus)) {
      throw new BadRequestException(
        `Không thể chuyển từ trạng thái ${returnTicket.status} sang ${newStatus}`
      );
    }

    try {
      const updatedReturnTicket = await this.prisma.$transaction(async tx => {
        const paymentStatus =
          newStatus === 'Returned' ? 'Completed' : 'Pending';

        const updated = await tx.returnTicket.update({
          where: { id: returnTicketId },
          data: {
            status: newStatus,
            paymentStatus: paymentStatus,
          },
          include: {
            user: { select: { id: true, fullName: true } },
            productIdentity: {
              include: {
                product: { select: { id: true, name: true } },
                color: { select: { id: true, name: true } },
                orderDetail: {
                  include: {
                    order: true,
                  },
                },
              },
            },
            productReturn: true,
          },
        });

        if (newStatus === 'Returned' && returnTicket.productReturnId) {
          await tx.productReturn.update({
            where: { id: returnTicket.productReturnId },
            data: { status: 'Completed' },
          });

          await tx.productIdentity.update({
            where: { id: returnTicket.productIdentityId },
            data: {
              isSold: false,
              warrantyStartDate: null,
              warrantyEndDate: null,
              warrantyCount: 0,
            },
          });

          // Cập nhật returnStatus của OrderDetail thành true
          const orderDetail = returnTicket.productIdentity.orderDetail?.[0];
          if (orderDetail) {
            await tx.orderDetail.update({
              where: { id: orderDetail.id },
              data: { returnStatus: true },
            });
          }
        } else if (newStatus === 'Canceled' && returnTicket.productReturnId) {
          await tx.productReturn.update({
            where: { id: returnTicket.productReturnId },
            data: { status: 'Rejected' },
          });
        }

        return updated;
      });

      return {
        message: 'Cập nhật trạng thái phiếu đổi trả thành công',
        data: updatedReturnTicket,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          `Lỗi khi cập nhật trạng thái: ${error.message} (Code: ${error.code})`
        );
      }
      throw new BadRequestException(
        `Lỗi không xác định khi cập nhật trạng thái: ${error.message || String(error)}`
      );
    }
  }

  async getReturns(requesterId: number) {
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

    const returns = await this.prisma.productReturn.findMany({
      where: isAdminOrEmployee ? {} : { userId: requesterId },
      include: {
        user: { select: { id: true, fullName: true } },
        productIdentity: {
          include: {
            product: {
              include: {
                productFiles: {
                  where: { isMain: true },
                  include: { file: true },
                },
              },
            },
            color: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { returnDate: 'desc' },
    });

    const returnsWithImage = returns.map(ret => {
      const mainImage =
        ret.productIdentity?.product?.productFiles?.[0]?.file?.url || null;
      return {
        ...ret,
        productIdentity: {
          ...ret.productIdentity,
          product: {
            ...ret.productIdentity.product,
            imageUrl: mainImage,
          },
        },
      };
    });

    return {
      message: 'Lấy danh sách yêu cầu đổi trả thành công',
      data: returnsWithImage,
    };
  }

  async getReturnDetails(returnId: string, requesterId: number) {
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      include: { role: true },
    });

    if (!requester) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const productReturn = await this.prisma.productReturn.findUnique({
      where: { id: returnId },
      include: {
        user: { select: { id: true, fullName: true } },
        productIdentity: {
          include: {
            product: {
              include: {
                productFiles: {
                  where: { isMain: true },
                  include: { file: true },
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
      },
    });

    if (!productReturn) {
      throw new NotFoundException('Yêu cầu đổi trả không tồn tại');
    }

    const isAdminOrEmployee = ['Admin', 'Employee'].includes(
      requester.role.name
    );
    const isReturnOwner = productReturn.userId === requesterId;

    if (!isAdminOrEmployee && !isReturnOwner) {
      throw new BadRequestException(
        'Bạn không có quyền xem yêu cầu đổi trả này'
      );
    }

    const mainImage =
      productReturn.productIdentity?.product?.productFiles?.[0]?.file?.url ||
      null;

    return {
      message: 'Lấy chi tiết yêu cầu đổi trả thành công',
      data: {
        ...productReturn,
        productIdentity: {
          ...productReturn.productIdentity,
          product: {
            ...productReturn.productIdentity.product,
            imageUrl: mainImage,
          },
        },
      },
    };
  }

  async getReturnTickets(requesterId: number) {
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

    const returnTickets = await this.prisma.returnTicket.findMany({
      where: isAdminOrEmployee ? {} : { userId: requesterId },
      include: {
        user: { select: { id: true, fullName: true } },
        productIdentity: {
          include: {
            product: { select: { id: true, name: true } },
            color: { select: { id: true, name: true } },
          },
        },
        productReturn: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Lấy danh sách phiếu đổi trả thành công',
      data: returnTickets,
    };
  }

  async getReturnTicketDetails(returnTicketId: string, requesterId: number) {
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      include: { role: true },
    });

    if (!requester) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const returnTicket = await this.prisma.returnTicket.findUnique({
      where: { id: returnTicketId },
      include: {
        user: { select: { id: true, fullName: true } },
        productIdentity: {
          include: {
            product: {
              include: {
                productFiles: {
                  where: { isMain: true },
                  include: { file: true },
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
        productReturn: true,
      },
    });

    if (!returnTicket) {
      throw new NotFoundException('Phiếu đổi trả không tồn tại');
    }

    const isAdminOrEmployee = ['Admin', 'Employee'].includes(
      requester.role.name
    );
    const isReturnTicketOwner = returnTicket.userId === requesterId;

    if (!isAdminOrEmployee && !isReturnTicketOwner) {
      throw new BadRequestException('Bạn không có quyền xem phiếu đổi trả này');
    }

    const mainImage =
      returnTicket.productIdentity?.product?.productFiles?.[0]?.file?.url ||
      null;

    return {
      message: 'Lấy chi tiết phiếu đổi trả thành công',
      data: {
        ...returnTicket,
        productIdentity: {
          ...returnTicket.productIdentity,
          product: {
            ...returnTicket.productIdentity.product,
            imageUrl: mainImage,
          },
        },
      },
    };
  }

  private translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      Pending: 'Đang chờ',
      Approved: 'Đã duyệt',
      Rejected: 'Bị từ chối',
      Completed: 'Hoàn tất',
    };
    return statusMap[status] || status;
  }
}
