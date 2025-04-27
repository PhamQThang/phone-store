// warranty.controller.ts
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
import { WarrantyService } from './warranty.service';
import {
  CreateWarrantyRequestDto,
  UpdateWarrantyRequestStatusDto,
} from './dto/warranty-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('warranty')
@Controller('warranty')
export class WarrantyController {
  constructor(private readonly warrantyService: WarrantyService) {}

  @Post('request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Tạo yêu cầu bảo hành mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo yêu cầu bảo hành thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Tạo yêu cầu bảo hành thành công' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'number' },
            productIdentityId: { type: 'string' },
            reason: { type: 'string' },
            fullName: { type: 'string' },
            phoneNumber: { type: 'string' },
            email: { type: 'string' },
            status: { type: 'string' },
            requestDate: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  @HttpCode(HttpStatus.CREATED)
  async createWarrantyRequest(
    @Req() req: Request,
    @Body() createWarrantyRequestDto: CreateWarrantyRequestDto
  ) {
    const userId = req.user['userId'];
    return this.warrantyService.createWarrantyRequest(
      userId,
      createWarrantyRequestDto
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cập nhật trạng thái phiếu bảo hành (Admin/Employee)',
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
            'Repairing',
            'Repaired',
            'Returned',
            'Canceled',
          ],
          description: 'Trạng thái mới của phiếu bảo hành',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật trạng thái phiếu bảo hành thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Cập nhật trạng thái phiếu bảo hành thành công',
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
            warrantyRequestId: { type: 'string', nullable: true },
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
            warrantyRequest: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                userId: { type: 'number' },
                productIdentityId: { type: 'string' },
                reason: { type: 'string' },
                fullName: { type: 'string' },
                phoneNumber: { type: 'string' },
                email: { type: 'string' },
                status: { type: 'string' },
                requestDate: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                User: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    fullName: { type: 'string' },
                  },
                },
                ProductIdentity: {
                  type: 'object',
                  properties: {
                    product: {
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
    },
  })
  @ApiResponse({ status: 400, description: 'Trạng thái không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({ status: 404, description: 'Phiếu bảo hành không tồn tại' })
  @HttpCode(HttpStatus.OK)
  async updateWarrantyStatus(
    @Req() req: Request,
    @Param('id') warrantyId: string,
    @Body() updateWarrantyStatusDto: UpdateWarrantyRequestStatusDto
  ) {
    const requesterId = req.user['userId'];
    return this.warrantyService.updateWarrantyStatus(
      warrantyId,
      requesterId,
      updateWarrantyStatusDto.status
    );
  }

  @Patch('request/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cập nhật trạng thái yêu cầu bảo hành (Admin/Employee)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Canceled'],
          description: 'Trạng thái mới của yêu cầu bảo hành',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật trạng thái yêu cầu bảo hành thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Cập nhật trạng thái yêu cầu bảo hành thành công',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'number' },
            productIdentityId: { type: 'string' },
            reason: { type: 'string' },
            fullName: { type: 'string' },
            phoneNumber: { type: 'string' },
            email: { type: 'string' },
            status: { type: 'string' },
            requestDate: { type: 'string', format: 'date-time' },
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
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Trạng thái không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({ status: 404, description: 'Yêu cầu bảo hành không tồn tại' })
  @HttpCode(HttpStatus.OK)
  async updateWarrantyRequestStatus(
    @Req() req: Request,
    @Param('id') requestId: string,
    @Body() updateWarrantyRequestStatusDto: UpdateWarrantyRequestStatusDto
  ) {
    const requesterId = req.user['userId'];
    return this.warrantyService.updateWarrantyRequestStatus(
      requestId,
      requesterId,
      updateWarrantyRequestStatusDto.status
    );
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu bảo hành' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách yêu cầu bảo hành thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Lấy danh sách yêu cầu bảo hành thành công',
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
              fullName: { type: 'string' },
              phoneNumber: { type: 'string' },
              email: { type: 'string' },
              status: { type: 'string' },
              requestDate: { type: 'string', format: 'date-time' },
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
  async getWarrantyRequests(@Req() req: Request) {
    const requesterId = req.user['userId'];
    return this.warrantyService.getWarrantyRequests(requesterId);
  }

  @Get('request/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy chi tiết yêu cầu bảo hành' })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết yêu cầu bảo hành thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Lấy chi tiết yêu cầu bảo hành thành công',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'number' },
            productIdentityId: { type: 'string' },
            reason: { type: 'string' },
            fullName: { type: 'string' },
            phoneNumber: { type: 'string' },
            email: { type: 'string' },
            status: { type: 'string' },
            requestDate: { type: 'string', format: 'date-time' },
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
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({ status: 404, description: 'Yêu cầu bảo hành không tồn tại' })
  @HttpCode(HttpStatus.OK)
  async getWarrantyRequestDetails(
    @Req() req: Request,
    @Param('id') requestId: string
  ) {
    const requesterId = req.user['userId'];
    return this.warrantyService.getWarrantyRequestDetails(
      requestId,
      requesterId
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy danh sách phiếu bảo hành' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách phiếu bảo hành thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Lấy danh sách phiếu bảo hành thành công',
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
              warrantyRequestId: { type: 'string', nullable: true },
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
              warrantyRequest: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string' },
                  userId: { type: 'number' },
                  productIdentityId: { type: 'string' },
                  reason: { type: 'string' },
                  fullName: { type: 'string' },
                  phoneNumber: { type: 'string' },
                  email: { type: 'string' },
                  status: { type: 'string' },
                  requestDate: { type: 'string', format: 'date-time' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  User: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      fullName: { type: 'string' },
                    },
                  },
                  ProductIdentity: {
                    type: 'object',
                    properties: {
                      product: {
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
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại' })
  @HttpCode(HttpStatus.OK)
  async getWarranties(@Req() req: Request) {
    const requesterId = req.user['userId'];
    return this.warrantyService.getWarranties(requesterId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy chi tiết phiếu bảo hành' })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết phiếu bảo hành thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Lấy chi tiết phiếu bảo hành thành công',
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
            warrantyRequestId: { type: 'string', nullable: true },
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
            warrantyRequest: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                userId: { type: 'number' },
                productIdentityId: { type: 'string' },
                reason: { type: 'string' },
                fullName: { type: 'string' },
                phoneNumber: { type: 'string' },
                email: { type: 'string' },
                status: { type: 'string' },
                requestDate: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                User: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    fullName: { type: 'string' },
                  },
                },
                ProductIdentity: {
                  type: 'object',
                  properties: {
                    product: {
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
    },
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({ status: 404, description: 'Phiếu bảo hành không tồn tại' })
  @HttpCode(HttpStatus.OK)
  async getWarrantyDetails(
    @Req() req: Request,
    @Param('id') warrantyId: string
  ) {
    const requesterId = req.user['userId'];
    return this.warrantyService.getWarrantyDetails(warrantyId, requesterId);
  }
}
