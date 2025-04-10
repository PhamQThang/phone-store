// backend/src/models/models.controller.ts
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
import { ModelsService } from './models.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('models')
@Controller('models')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @ApiOperation({ summary: 'Tạo một model mới' })
  @ApiResponse({ status: 201, description: 'Tạo model thành công' })
  @ApiResponse({
    status: 400,
    description: 'Tên model đã tồn tại trong thương hiệu này',
  })
  @ApiResponse({ status: 404, description: 'Thương hiệu không tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async create(@Body() createModelDto: CreateModelDto) {
    return this.modelsService.create(createModelDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các model' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách model thành công' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async findAll() {
    return this.modelsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một model' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin model thành công' })
  @ApiResponse({ status: 404, description: 'Model không tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async findOne(@Param('id') id: string) {
    return this.modelsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @ApiOperation({ summary: 'Cập nhật thông tin của một model' })
  @ApiResponse({ status: 200, description: 'Cập nhật model thành công' })
  @ApiResponse({
    status: 404,
    description: 'Model hoặc thương hiệu không tồn tại',
  })
  @ApiResponse({
    status: 400,
    description: 'Tên model đã tồn tại trong thương hiệu này',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async update(
    @Param('id') id: string,
    @Body() updateModelDto: UpdateModelDto
  ) {
    return this.modelsService.update(id, updateModelDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @ApiOperation({ summary: 'Xóa một model' })
  @ApiResponse({ status: 200, description: 'Xóa model thành công' })
  @ApiResponse({ status: 404, description: 'Model không tồn tại' })
  @ApiResponse({
    status: 400,
    description: 'Không thể xóa model vì có sản phẩm liên quan',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async remove(@Param('id') id: string) {
    return this.modelsService.remove(id);
  }
}
