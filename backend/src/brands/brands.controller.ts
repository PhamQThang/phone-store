// backend/src/brands/brands.controller.ts
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
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Tạo một thương hiệu mới' })
  @ApiResponse({ status: 201, description: 'Tạo thương hiệu thành công' })
  @ApiResponse({ status: 400, description: 'Tên thương hiệu đã tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các thương hiệu' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thương hiệu thành công',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async findAll() {
    return this.brandsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một thương hiệu' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thương hiệu thành công',
  })
  @ApiResponse({ status: 404, description: 'Thương hiệu không tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('Admin') // Chỉ Admin được cập nhật brand
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật thông tin của một thương hiệu' })
  @ApiResponse({ status: 200, description: 'Cập nhật thương hiệu thành công' })
  @ApiResponse({ status: 404, description: 'Thương hiệu không tồn tại' })
  @ApiResponse({ status: 400, description: 'Tên thương hiệu đã tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto
  ) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Xóa một thương hiệu' })
  @ApiResponse({ status: 200, description: 'Xóa thương hiệu thành công' })
  @ApiResponse({ status: 404, description: 'Thương hiệu không tồn tại' })
  @ApiResponse({
    status: 400,
    description: 'Không thể xóa thương hiệu vì có model liên quan',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}
