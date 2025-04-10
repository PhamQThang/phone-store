// backend/src/products/products.controller.ts
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
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @ApiOperation({ summary: 'Tạo một sản phẩm mới' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Tạo sản phẩm thành công' })
  @ApiResponse({ status: 400, description: 'Slug sản phẩm đã tồn tại' })
  @ApiResponse({ status: 404, description: 'Model không tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  @UseInterceptors(FilesInterceptor('files', 10)) // Giới hạn 10 file
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    createProductDto.files = files || [];
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách sản phẩm thành công',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin sản phẩm thành công',
  })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @ApiOperation({ summary: 'Cập nhật thông tin của một sản phẩm' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Cập nhật sản phẩm thành công' })
  @ApiResponse({
    status: 404,
    description: 'Sản phẩm hoặc model không tồn tại',
  })
  @ApiResponse({ status: 400, description: 'Slug sản phẩm đã tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    updateProductDto.files = files || [];
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @ApiOperation({ summary: 'Xóa một sản phẩm' })
  @ApiResponse({ status: 200, description: 'Xóa sản phẩm thành công' })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  @ApiResponse({
    status: 400,
    description: 'Không thể xóa sản phẩm vì có dữ liệu liên quan',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
