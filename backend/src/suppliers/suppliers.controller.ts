// backend/src/suppliers/suppliers.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard) // Yêu cầu đăng nhập
@ApiBearerAuth('access-token')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('Admin') // Chỉ Admin được tạo nhà cung cấp
  @ApiOperation({ summary: 'Tạo một nhà cung cấp mới' })
  @ApiResponse({ status: 201, description: 'Tạo nhà cung cấp thành công' })
  @ApiResponse({ status: 400, description: 'Số điện thoại đã tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các nhà cung cấp' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách nhà cung cấp thành công',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một nhà cung cấp' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin nhà cung cấp thành công',
  })
  @ApiResponse({ status: 404, description: 'Nhà cung cấp không tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('Admin') // Chỉ Admin được cập nhật nhà cung cấp
  @ApiOperation({ summary: 'Cập nhật thông tin của một nhà cung cấp' })
  @ApiResponse({ status: 200, description: 'Cập nhật nhà cung cấp thành công' })
  @ApiResponse({ status: 404, description: 'Nhà cung cấp không tồn tại' })
  @ApiResponse({ status: 400, description: 'Số điện thoại đã tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto
  ) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('Admin') // Chỉ Admin được xóa nhà cung cấp
  @ApiOperation({ summary: 'Xóa một nhà cung cấp' })
  @ApiResponse({ status: 200, description: 'Xóa nhà cung cấp thành công' })
  @ApiResponse({ status: 404, description: 'Nhà cung cấp không tồn tại' })
  @ApiResponse({
    status: 400,
    description: 'Không thể xóa nhà cung cấp vì có đơn nhập hàng liên quan',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}
