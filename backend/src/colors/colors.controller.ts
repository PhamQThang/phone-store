// backend/src/colors/colors.controller.ts
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
import { ColorsService } from './colors.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('colors')
@Controller('colors')
@UseGuards(JwtAuthGuard) // Yêu cầu đăng nhập
@ApiBearerAuth('access-token')
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) {}

  @Post()
  @UseGuards(RoleGuard) // Yêu cầu vai trò
  @Roles('Admin') // Chỉ Admin được tạo color
  @ApiOperation({ summary: 'Tạo một màu mới' })
  @ApiResponse({ status: 201, description: 'Tạo màu thành công' })
  @ApiResponse({ status: 400, description: 'Tên màu đã tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async create(@Body() createColorDto: CreateColorDto) {
    return this.colorsService.create(createColorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các màu' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách màu thành công' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async findAll() {
    return this.colorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một màu' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin màu thành công' })
  @ApiResponse({ status: 404, description: 'Màu không tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async findOne(@Param('id') id: string) {
    return this.colorsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('Admin') // Chỉ Admin được cập nhật color
  @ApiOperation({ summary: 'Cập nhật thông tin của một màu' })
  @ApiResponse({ status: 200, description: 'Cập nhật màu thành công' })
  @ApiResponse({ status: 404, description: 'Màu không tồn tại' })
  @ApiResponse({ status: 400, description: 'Tên màu đã tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async update(
    @Param('id') id: string,
    @Body() updateColorDto: UpdateColorDto
  ) {
    return this.colorsService.update(id, updateColorDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('Admin') // Chỉ Admin được xóa color
  @ApiOperation({ summary: 'Xóa một màu' })
  @ApiResponse({ status: 200, description: 'Xóa màu thành công' })
  @ApiResponse({ status: 404, description: 'Màu không tồn tại' })
  @ApiResponse({
    status: 400,
    description:
      'Không thể xóa màu vì có dữ liệu liên quan (sản phẩm, đơn hàng, hoặc đơn nhập hàng)',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async remove(@Param('id') id: string) {
    return this.colorsService.remove(id);
  }
}
