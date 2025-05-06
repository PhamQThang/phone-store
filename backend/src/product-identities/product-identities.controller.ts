import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProductIdentitiesService } from './product-identities.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('product-identities')
@Controller('product-identities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ProductIdentitiesController {
  constructor(
    private readonly productIdentitiesService: ProductIdentitiesService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các product identity' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách product identity thành công',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async findAll(@Query('sold') sold?: string) {
    return this.productIdentitiesService.findAll(sold);
  }
}
