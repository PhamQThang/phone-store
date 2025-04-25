// src/cart/cart.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service'; // Import ProductsService
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService // Inject ProductsService
  ) {}

  async getCartItems(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        cartItems: {
          include: {
            product: {
              include: { productFiles: { include: { file: true } } },
            },
            color: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    const cartItemsWithDiscountedPrice = await Promise.all(
      cart.cartItems.map(async item => {
        const productWithDiscountedPrice = await this.productsService.findOne(
          item.product.id
        );
        return {
          ...item,
          product: productWithDiscountedPrice.data, // Lấy data từ kết quả
        };
      })
    );

    return {
      message: 'Lấy danh sách sản phẩm trong giỏ hàng thành công',
      data: cartItemsWithDiscountedPrice,
    };
  }

  async addToCart(cartId: string, createCartItemDto: CreateCartItemDto) {
    const { productId, colorId, quantity } = createCartItemDto;

    const cart = await this.prisma.cart.findUnique({ where: { id: cartId } });
    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    const product = await this.productsService.findOne(productId);
    if (!product) {
      throw new BadRequestException('Sản phẩm không tồn tại');
    }

    const color = await this.prisma.color.findUnique({
      where: { id: colorId },
    });
    if (!color) {
      throw new BadRequestException('Màu sắc không tồn tại');
    }

    try {
      const existingCartItem = await this.prisma.cartItem.findFirst({
        where: {
          cartId,
          productId,
          colorId,
        },
      });

      if (existingCartItem) {
        const updatedCartItem = await this.prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + quantity },
          include: {
            product: { include: { productFiles: { include: { file: true } } } },
            color: true,
          },
        });

        const productWithDiscountedPrice = await this.productsService.findOne(
          updatedCartItem.product.id
        );
        return {
          message: 'Cập nhật số lượng sản phẩm trong giỏ hàng thành công',
          data: {
            ...updatedCartItem,
            product: productWithDiscountedPrice.data, // Lấy data từ kết quả
          },
        };
      }

      const newCartItem = await this.prisma.cartItem.create({
        data: {
          cartId,
          productId,
          colorId,
          quantity,
        },
        include: {
          product: { include: { productFiles: { include: { file: true } } } },
          color: true,
        },
      });

      const productWithDiscountedPrice = await this.productsService.findOne(
        newCartItem.product.id
      );
      return {
        message: 'Thêm sản phẩm vào giỏ hàng thành công',
        data: {
          ...newCartItem,
          product: productWithDiscountedPrice.data, // Lấy data từ kết quả
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Sản phẩm với màu sắc này đã có trong giỏ hàng'
          );
        }
      }
      throw error;
    }
  }

  async updateCartItem(
    cartId: string,
    cartItemId: string,
    updateCartItemDto: UpdateCartItemDto
  ) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem) {
      throw new NotFoundException('Mục giỏ hàng không tồn tại');
    }

    if (cartItem.cartId !== cartId) {
      throw new BadRequestException('Bạn không có quyền cập nhật mục này');
    }

    const updatedCartItem = await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: updateCartItemDto,
      include: {
        product: { include: { productFiles: { include: { file: true } } } },
        color: true,
      },
    });

    const productWithDiscountedPrice = await this.productsService.findOne(
      updatedCartItem.product.id
    );
    return {
      message: 'Cập nhật số lượng sản phẩm trong giỏ hàng thành công',
      data: {
        ...updatedCartItem,
        product: productWithDiscountedPrice.data, // Lấy data từ kết quả
      },
    };
  }

  async removeFromCart(cartId: string, cartItemId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem) {
      throw new NotFoundException('Mục giỏ hàng không tồn tại');
    }

    if (cartItem.cartId !== cartId) {
      throw new BadRequestException('Bạn không có quyền xóa mục này');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return {
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
    };
  }
}
