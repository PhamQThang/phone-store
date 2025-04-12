// src/cart/cart.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm trong giỏ hàng' })
  @ApiQuery({ name: 'cartId', required: true, description: 'ID của giỏ hàng' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách sản phẩm trong giỏ hàng thành công',
  })
  @ApiResponse({ status: 404, description: 'Giỏ hàng không tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async getCartItems(@Query('cartId') cartId: string) {
    return this.cartService.getCartItems(cartId);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ hàng' })
  @ApiQuery({ name: 'cartId', required: true, description: 'ID của giỏ hàng' })
  @ApiResponse({
    status: 201,
    description: 'Thêm sản phẩm vào giỏ hàng thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'Sản phẩm hoặc màu sắc không tồn tại',
  })
  @ApiResponse({ status: 404, description: 'Giỏ hàng không tồn tại' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async addToCart(
    @Query('cartId') cartId: string,
    @Body() createCartItemDto: CreateCartItemDto
  ) {
    return this.cartService.addToCart(cartId, createCartItemDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật số lượng sản phẩm trong giỏ hàng' })
  @ApiQuery({ name: 'cartId', required: true, description: 'ID của giỏ hàng' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật số lượng sản phẩm trong giỏ hàng thành công',
  })
  @ApiResponse({ status: 404, description: 'Mục giỏ hàng không tồn tại' })
  @ApiResponse({
    status: 400,
    description: 'Bạn không có quyền cập nhật mục này',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async updateCartItem(
    @Query('cartId') cartId: string,
    @Param('id') cartItemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto
  ) {
    return this.cartService.updateCartItem(
      cartId,
      cartItemId,
      updateCartItemDto
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi giỏ hàng' })
  @ApiQuery({ name: 'cartId', required: true, description: 'ID của giỏ hàng' })
  @ApiResponse({
    status: 200,
    description: 'Xóa sản phẩm khỏi giỏ hàng thành công',
  })
  @ApiResponse({ status: 404, description: 'Mục giỏ hàng không tồn tại' })
  @ApiResponse({ status: 400, description: 'Bạn không có quyền xóa mục này' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async removeFromCart(
    @Query('cartId') cartId: string,
    @Param('id') cartItemId: string
  ) {
    return this.cartService.removeFromCart(cartId, cartItemId);
  }
}
