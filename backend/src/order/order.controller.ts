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
  Query,
  Res,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

@ApiTags('order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Tạo đơn hàng mới từ giỏ hàng' })
  @ApiResponse({
    status: 201,
    description: 'Tạo đơn hàng thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Tạo đơn hàng thành công' },
        data: {
          type: 'object',
          properties: {
            order: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                userId: { type: 'number' },
                address: { type: 'string' },
                totalAmount: { type: 'number' },
                paymentMethod: { type: 'string' },
                status: { type: 'string' },
                paymentStatus: { type: 'string' },
                phoneNumber: { type: 'string' },
                note: { type: 'string' },
              },
            },
            paymentUrl: { type: 'string', nullable: true },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 404,
    description: 'Giỏ hàng hoặc sản phẩm không tồn tại',
  })
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Req() req: Request,
    @Body() createOrderDto: CreateOrderDto
  ) {
    const userId = req.user['userId'];
    const ipAddr = req.ip || req.connection.remoteAddress;
    return this.orderService.createOrder(userId, createOrderDto, ipAddr);
  }

  @Get('vnpay-return')
  @ApiOperation({ summary: 'Xử lý callback từ VNPay sau khi thanh toán' })
  @ApiQuery({ name: 'vnp_TxnRef', type: String, description: 'Mã đơn hàng' })
  @ApiQuery({
    name: 'vnp_ResponseCode',
    type: String,
    description: 'Mã phản hồi VNPay',
  })
  @ApiQuery({
    name: 'vnp_TransactionStatus',
    type: String,
    description: 'Trạng thái giao dịch',
  })
  @ApiQuery({
    name: 'vnp_SecureHash',
    type: String,
    description: 'Chữ ký bảo mật',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect về trang danh sách đơn hàng trên frontend',
  })
  @ApiResponse({
    status: 400,
    description: 'Chữ ký không hợp lệ hoặc dữ liệu không hợp lệ',
  })
  @ApiResponse({ status: 404, description: 'Đơn hàng không tồn tại' })
  async handleVNPayReturn(
    @Query() query: { [key: string]: string },
    @Res() res: Response
  ) {
    const result = await this.orderService.handleVNPayReturn(query);
    const { orderId, isSuccess } = result;

    // Tạo URL redirect cho FE
    const frontendBaseUrl =
      process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendBaseUrl}/client/orders?orderId=${orderId}&success=${isSuccess}`;

    // Redirect đến FE
    return res.redirect(redirectUrl);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cập nhật trạng thái đơn hàng (cho người dùng/nhân viên/admin)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['Pending', 'Confirmed', 'Shipping', 'Delivered', 'Canceled'],
          description: 'Trạng thái mới của đơn hàng',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật trạng thái đơn hàng thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Cập nhật trạng thái đơn hàng thành công',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            address: { type: 'string' },
            totalAmount: { type: 'number' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            phoneNumber: { type: 'string', nullable: true },
            paymentMethod: { type: 'string' },
            paymentStatus: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
              },
            },
            orderDetails: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      name: { type: 'string' },
                      price: { type: 'number' },
                      discountedPrice: { type: 'number' },
                    },
                  },
                  color: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      name: { type: 'string' },
                    },
                  },
                  productIdentity: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      isSold: { type: 'boolean' },
                    },
                  },
                  price: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Trạng thái hoặc quyền không hợp lệ',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({ status: 404, description: 'Đơn hàng không tồn tại' })
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(
    @Req() req: Request,
    @Param('id') orderId: string,
    @Body('status') status: string
  ) {
    const requesterId = req.user['userId'];
    return this.orderService.updateOrderStatus(orderId, requesterId, status);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Lấy danh sách đơn hàng (cho người dùng/nhân viên/admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách đơn hàng thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Lấy danh sách đơn hàng thành công',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              address: { type: 'string' },
              totalAmount: { type: 'number' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              phoneNumber: { type: 'string', nullable: true },
              paymentMethod: { type: 'string' },
              paymentStatus: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                },
              },
              orderDetails: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    product: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        name: { type: 'string' },
                        price: { type: 'number' },
                        discountedPrice: { type: 'number' },
                      },
                    },
                    color: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        name: { type: 'string' },
                      },
                    },
                    price: { type: 'number' },
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
  async getUserOrders(@Req() req: Request) {
    const requesterId = req.user['userId'];
    return this.orderService.getUserOrders(requesterId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Lấy chi tiết đơn hàng (cho người dùng/nhân viên/admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết đơn hàng thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Lấy chi tiết đơn hàng thành công',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            address: { type: 'string' },
            totalAmount: { type: 'number' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            phoneNumber: { type: 'string', nullable: true },
            paymentMethod: { type: 'string' },
            paymentStatus: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
              },
            },
            orderDetails: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      name: { type: 'string' },
                      price: { type: 'number' },
                      discountedPrice: { type: 'number' },
                    },
                  },
                  color: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      name: { type: 'string' },
                    },
                  },
                  productIdentity: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      isSold: { type: 'boolean' },
                    },
                  },
                  price: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 404,
    description: 'Đơn hàng hoặc người dùng không tồn tại',
  })
  @ApiResponse({ status: 400, description: 'Quyền truy cập bị từ chối' })
  @HttpCode(HttpStatus.OK)
  async getOrderDetails(@Req() req: Request, @Param('id') orderId: string) {
    const requesterId = req.user['userId'];
    return this.orderService.getOrderDetails(orderId, requesterId);
  }
}
