// backend/src/purchase-orders/purchase-orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('purchase-orders')
@Controller('purchase-orders')
@UseGuards(JwtAuthGuard) // Yêu cầu đăng nhập
@ApiBearerAuth('access-token')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('Admin', 'Employee')
  @ApiOperation({ summary: 'Tạo một đơn nhập hàng mới' })
  @ApiResponse({ status: 201, description: 'Tạo đơn nhập hàng thành công' })
  @ApiResponse({ status: 400, description: 'Không thể tạo đơn nhập hàng' })
  @ApiResponse({
    status: 404,
    description: 'Nhà cung cấp hoặc sản phẩm không tồn tại',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async create(
    @Body() createPurchaseOrderDto: CreatePurchaseOrderDto,
    @Request() req: any
  ) {
    const createdById = req.user?.userId; // Sửa id thành userId
    if (!createdById) {
      throw new UnauthorizedException('Không thể xác định người dùng từ token');
    }
    return this.purchaseOrdersService.create(
      createPurchaseOrderDto,
      createdById
    );
  }

  @Get()
  @UseGuards(RoleGuard)
  @Roles('Admin', 'Employee') // Chỉ Admin và Employee được xem danh sách
  @ApiOperation({ summary: 'Lấy danh sách tất cả các đơn nhập hàng' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách đơn nhập hàng thành công',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async findAll() {
    return this.purchaseOrdersService.findAll();
  }

  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles('Admin', 'Employee') // Chỉ Admin và Employee được xem chi tiết
  @ApiOperation({ summary: 'Lấy chi tiết một đơn nhập hàng' })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết đơn nhập hàng thành công',
  })
  @ApiResponse({ status: 404, description: 'Đơn nhập hàng không tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('Admin', 'Employee') // Chỉ Admin và Employee được cập nhật
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn nhập hàng' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật đơn nhập hàng thành công',
  })
  @ApiResponse({ status: 404, description: 'Đơn nhập hàng không tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto
  ) {
    return this.purchaseOrdersService.update(id, updatePurchaseOrderDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('Admin', 'Employee') // Chỉ Admin và Employee được xóa
  @ApiOperation({ summary: 'Xóa một đơn nhập hàng' })
  @ApiResponse({ status: 200, description: 'Xóa đơn nhập hàng thành công' })
  @ApiResponse({ status: 404, description: 'Đơn nhập hàng không tồn tại' })
  @ApiResponse({
    status: 400,
    description: 'Không thể xóa đơn nhập hàng đã hoàn tất',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async remove(@Param('id') id: string) {
    return this.purchaseOrdersService.remove(id);
  }
}
