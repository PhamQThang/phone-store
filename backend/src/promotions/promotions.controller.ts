import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { AddProductToPromotionDto } from './dto/add-product-to-promotion.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Tạo một khuyến mãi mới' })
  @ApiResponse({ status: 201, description: 'Tạo khuyến mãi thành công' })
  @ApiResponse({
    status: 400,
    description: 'Mã khuyến mãi đã tồn tại hoặc dữ liệu không hợp lệ',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các khuyến mãi' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách khuyến mãi thành công',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async findAll() {
    return this.promotionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một khuyến mãi' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin khuyến mãi thành công',
  })
  @ApiResponse({ status: 404, description: 'Khuyến mãi không tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật thông tin của một khuyến mãi' })
  @ApiResponse({ status: 200, description: 'Cập nhật khuyến mãi thành công' })
  @ApiResponse({ status: 404, description: 'Khuyến mãi không tồn tại' })
  @ApiResponse({
    status: 400,
    description: 'Mã khuyến mãi đã tồn tại hoặc dữ liệu không hợp lệ',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto
  ) {
    return this.promotionsService.update(id, updatePromotionDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Xóa một khuyến mãi' })
  @ApiResponse({ status: 200, description: 'Xóa khuyến mãi thành công' })
  @ApiResponse({ status: 404, description: 'Khuyến mãi không tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }

  @Post(':id/products')
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Thêm sản phẩm vào khuyến mãi' })
  @ApiResponse({
    status: 201,
    description: 'Thêm sản phẩm vào khuyến mãi thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Khuyến mãi hoặc sản phẩm không tồn tại',
  })
  @ApiResponse({
    status: 400,
    description: 'Sản phẩm đã được liên kết với khuyến mãi này',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async addProductToPromotion(
    @Param('id') id: string,
    @Body() addProductToPromotionDto: AddProductToPromotionDto
  ) {
    return this.promotionsService.addProductToPromotion(
      id,
      addProductToPromotionDto
    );
  }

  @Delete(':id/products/:productId')
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi khuyến mãi' })
  @ApiResponse({
    status: 200,
    description: 'Xóa sản phẩm khỏi khuyến mãi thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Khuyến mãi hoặc sản phẩm không tồn tại',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  @HttpCode(HttpStatus.OK)
  async removeProductFromPromotion(
    @Param('id') id: string,
    @Param('productId') productId: string
  ) {
    return this.promotionsService.removeProductFromPromotion(id, productId);
  }
}
