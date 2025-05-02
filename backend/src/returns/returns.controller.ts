import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ReturnsService } from './returns.service';
import {
  CreateReturnDto,
  UpdateReturnStatusDto,
  UpdateReturnTicketStatusDto,
} from './dto/returns.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('returns')
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post('request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Tạo yêu cầu đổi trả mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo yêu cầu đổi trả thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Tạo yêu cầu đổi trả thành công' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'number' },
            productIdentityId: { type: 'string' },
            reason: { type: 'string' },
            returnDate: { type: 'string', format: 'date-time' },
            status: { type: 'string' },
            fullName: { type: 'string', example: 'Nguyễn Văn A' },
            phoneNumber: { type: 'string', example: '0909123456' },
            address: {
              type: 'string',
              example: '123 Đường Láng, Đống Đa, Hà Nội',
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                fullName: { type: 'string' },
              },
            },
            productIdentity: {
              type: 'object',
              properties: {
                product: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    imageUrl: { type: 'string', nullable: true },
                  },
                },
                color: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  @HttpCode(HttpStatus.CREATED)
  async createReturn(
    @Req() req: Request,
    @Body() createReturnDto: CreateReturnDto
  ) {
    const userId = req.user['userId'];
    return this.returnsService.createReturn(userId, createReturnDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cập nhật trạng thái yêu cầu đổi trả (Admin/Employee)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
          description: 'Trạng thái mới của yêu cầu đổi trả',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật trạng thái yêu cầu đổi trả thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Cập nhật trạng thái yêu cầu đổi trả thành công',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'number' },
            productIdentityId: { type: 'string' },
            reason: { type: 'string' },
            returnDate: { type: 'string', format: 'date-time' },
            status: { type: 'string' },
            fullName: { type: 'string', example: 'Nguyễn Văn A' },
            phoneNumber: { type: 'string', example: '0909123456' },
            address: {
              type: 'string',
              example: '123 Đường Láng, Đống Đa, Hà Nội',
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                fullName: { type: 'string' },
              },
            },
            productIdentity: {
              type: 'object',
              properties: {
                product: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    imageUrl: { type: 'string', nullable: true },
                  },
                },
                color: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
                orderDetail: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      order: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          createdAt: { type: 'string', format: 'date-time' },
                          paymentMethod: { type: 'string' },
                          paymentStatus: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Trạng thái không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({ status: 404, description: 'Yêu cầu đổi trả không tồn tại' })
  @HttpCode(HttpStatus.OK)
  async updateReturnStatus(
    @Req() req: Request,
    @Param('id') returnId: string,
    @Body() updateReturnStatusDto: UpdateReturnStatusDto
  ) {
    const requesterId = req.user['userId'];
    return this.returnsService.updateReturnStatus(
      returnId,
      requesterId,
      updateReturnStatusDto.status
    );
  }

  @Patch('ticket/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cập nhật trạng thái phiếu đổi trả (Admin/Employee)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: [
            'Requested',
            'Processing',
            'Processed',
            'Returned',
            'Canceled',
          ],
          description: 'Trạng thái mới của phiếu đổi trả',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật trạng thái phiếu đổi trả thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Cập nhật trạng thái phiếu đổi trả thành công',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'number' },
            productIdentityId: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            status: { type: 'string' },
            note: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            productReturnId: { type: 'string' },
            originalPrice: { type: 'number', nullable: true },
            discountedPrice: { type: 'number', nullable: true },
            paymentMethod: { type: 'string', nullable: true },
            paymentStatus: { type: 'string', nullable: true },
            fullName: {
              type: 'string',
              example: 'Nguyễn Văn A',
              nullable: true,
            },
            phoneNumber: {
              type: 'string',
              example: '0909123456',
              nullable: true,
            },
            address: {
              type: 'string',
              example: '123 Đường Láng, Đống Đa, Hà Nội',
              nullable: true,
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                fullName: { type: 'string' },
              },
            },
            productIdentity: {
              type: 'object',
              properties: {
                product: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
                color: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
            },
            productReturn: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                userId: { type: 'number' },
                productIdentityId: { type: 'string' },
                reason: { type: 'string' },
                returnDate: { type: 'string', format: 'date-time' },
                status: { type: 'string' },
                fullName: { type: 'string', example: 'Nguyễn Văn A' },
                phoneNumber: { type: 'string', example: '0909123456' },
                address: {
                  type: 'string',
                  example: '123 Đường Láng, Đống Đa, Hà Nội',
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Trạng thái không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({ status: 404, description: 'Phiếu đổi trả không tồn tại' })
  @HttpCode(HttpStatus.OK)
  async updateReturnTicketStatus(
    @Req() req: Request,
    @Param('id') returnTicketId: string,
    @Body() updateReturnTicketStatusDto: UpdateReturnTicketStatusDto
  ) {
    const requesterId = req.user['userId'];
    return this.returnsService.updateReturnTicketStatus(
      returnTicketId,
      requesterId,
      updateReturnTicketStatusDto.status
    );
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu đổi trả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách yêu cầu đổi trả thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Lấy danh sách yêu cầu đổi trả thành công',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'number' },
              productIdentityId: { type: 'string' },
              reason: { type: 'string' },
              returnDate: { type: 'string', format: 'date-time' },
              status: { type: 'string' },
              fullName: { type: 'string', example: 'Nguyễn Văn A' },
              phoneNumber: { type: 'string', example: '0909123456' },
              address: {
                type: 'string',
                example: '123 Đường Láng, Đống Đa, Hà Nội',
              },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  fullName: { type: 'string' },
                },
              },
              productIdentity: {
                type: 'object',
                properties: {
                  product: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      imageUrl: { type: 'string', nullable: true },
                    },
                  },
                  color: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại' })
  @HttpCode(HttpStatus.OK)
  async getReturns(@Req() req: Request) {
    const requesterId = req.user['userId'];
    return this.returnsService.getReturns(requesterId);
  }

  @Get('request/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy chi tiết yêu cầu đổi trả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết yêu cầu đổi trả thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Lấy chi tiết yêu cầu đổi trả thành công',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'number' },
            productIdentityId: { type: 'string' },
            reason: { type: 'string' },
            returnDate: { type: 'string', format: 'date-time' },
            status: { type: 'string' },
            fullName: { type: 'string', example: 'Nguyễn Văn A' },
            phoneNumber: { type: 'string', example: '0909123456' },
            address: {
              type: 'string',
              example: '123 Đường Láng, Đống Đa, Hà Nội',
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                fullName: { type: 'string' },
              },
            },
            productIdentity: {
              type: 'object',
              properties: {
                product: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    imageUrl: { type: 'string', nullable: true },
                  },
                },
                color: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
                orderDetail: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      order: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          createdAt: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({ status: 404, description: 'Yêu cầu đổi trả không tồn tại' })
  @HttpCode(HttpStatus.OK)
  async getReturnDetails(@Req() req: Request, @Param('id') returnId: string) {
    const requesterId = req.user['userId'];
    return this.returnsService.getReturnDetails(returnId, requesterId);
  }

  @Get('tickets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy danh sách phiếu đổi trả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách phiếu đổi trả thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Lấy danh sách phiếu đổi trả thành công',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'number' },
              productIdentityId: { type: 'string' },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              status: { type: 'string' },
              note: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              productReturnId: { type: 'string' },
              originalPrice: { type: 'number', nullable: true },
              discountedPrice: { type: 'number', nullable: true },
              paymentMethod: { type: 'string', nullable: true },
              paymentStatus: { type: 'string', nullable: true },
              fullName: {
                type: 'string',
                example: 'Nguyễn Văn A',
                nullable: true,
              },
              phoneNumber: {
                type: 'string',
                example: '0909123456',
                nullable: true,
              },
              address: {
                type: 'string',
                example: '123 Đường Láng, Đống Đa, Hà Nội',
                nullable: true,
              },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  fullName: { type: 'string' },
                },
              },
              productIdentity: {
                type: 'object',
                properties: {
                  product: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                  color: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
              productReturn: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  userId: { type: 'number' },
                  productIdentityId: { type: 'string' },
                  reason: { type: 'string' },
                  returnDate: { type: 'string', format: 'date-time' },
                  status: { type: 'string' },
                  fullName: { type: 'string', example: 'Nguyễn Văn A' },
                  phoneNumber: { type: 'string', example: '0909123456' },
                  address: {
                    type: 'string',
                    example: '123 Đường Láng, Đống Đa, Hà Nội',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại' })
  @HttpCode(HttpStatus.OK)
  async getReturnTickets(@Req() req: Request) {
    const requesterId = req.user['userId'];
    return this.returnsService.getReturnTickets(requesterId);
  }

  @Get('ticket/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy chi tiết phiếu đổi trả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết phiếu đổi trả thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Lấy chi tiết phiếu đổi trả thành công',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'number' },
            productIdentityId: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            status: { type: 'string' },
            note: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            productReturnId: { type: 'string' },
            originalPrice: { type: 'number', nullable: true },
            discountedPrice: { type: 'number', nullable: true },
            paymentMethod: { type: 'string', nullable: true },
            paymentStatus: { type: 'string', nullable: true },
            fullName: {
              type: 'string',
              example: 'Nguyễn Văn A',
              nullable: true,
            },
            phoneNumber: {
              type: 'string',
              example: '0909123456',
              nullable: true,
            },
            address: {
              type: 'string',
              example: '123 Đường Láng, Đống Đa, Hà Nội',
              nullable: true,
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                fullName: { type: 'string' },
              },
            },
            productIdentity: {
              type: 'object',
              properties: {
                product: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    imageUrl: { type: 'string', nullable: true },
                  },
                },
                color: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
                orderDetail: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      order: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          createdAt: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                  },
                },
              },
            },
            productReturn: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                userId: { type: 'number' },
                productIdentityId: { type: 'string' },
                reason: { type: 'string' },
                returnDate: { type: 'string', format: 'date-time' },
                status: { type: 'string' },
                fullName: { type: 'string', example: 'Nguyễn Văn A' },
                phoneNumber: { type: 'string', example: '0909123456' },
                address: {
                  type: 'string',
                  example: '123 Đường Láng, Đống Đa, Hà Nội',
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({ status: 404, description: 'Phiếu đổi trả không tồn tại' })
  @HttpCode(HttpStatus.OK)
  async getReturnTicketDetails(
    @Req() req: Request,
    @Param('id') returnTicketId: string
  ) {
    const requesterId = req.user['userId'];
    return this.returnsService.getReturnTicketDetails(
      returnTicketId,
      requesterId
    );
  }
}
