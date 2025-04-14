// backend/src/slides/slides.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SlidesService } from './slides.service';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UpdateSlideDto } from './dto/update-slide.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('slides')
@Controller('slides')
export class SlidesController {
  constructor(private readonly slidesService: SlidesService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Tạo một slide mới' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Tạo slide thành công' })
  @ApiResponse({ status: 400, description: 'File ảnh là bắt buộc' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createSlideDto: CreateSlideDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    createSlideDto.file = file;
    return this.slidesService.create(createSlideDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các slide' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách slide thành công' })
  async findAll() {
    return this.slidesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một slide' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin slide thành công' })
  @ApiResponse({ status: 404, description: 'Slide không tồn tại' })
  async findOne(@Param('id') id: string) {
    return this.slidesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật thông tin của một slide' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Cập nhật slide thành công' })
  @ApiResponse({ status: 404, description: 'Slide không tồn tại' })
  @ApiResponse({ status: 400, description: 'Lỗi khi cập nhật slide' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() updateSlideDto: UpdateSlideDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    updateSlideDto.file = file;
    return this.slidesService.update(id, updateSlideDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Xóa một slide' })
  @ApiResponse({ status: 200, description: 'Xóa slide thành công' })
  @ApiResponse({ status: 404, description: 'Slide không tồn tại' })
  @ApiResponse({ status: 400, description: 'Lỗi khi xóa slide' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async remove(@Param('id') id: string) {
    return this.slidesService.remove(id);
  }
}
