import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service'; // Inject ProductsService
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { AddProductToPromotionDto } from './dto/add-product-to-promotion.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PromotionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService // Inject ProductsService
  ) {}

  async create(createPromotionDto: CreatePromotionDto) {
    try {
      const { code, description, discount, startDate, endDate, isActive } =
        createPromotionDto;

      if (new Date(startDate) >= new Date(endDate)) {
        throw new BadRequestException(
          'Ngày bắt đầu phải nhỏ hơn ngày kết thúc'
        );
      }

      const promotion = await this.prisma.promotion.create({
        data: {
          code,
          description,
          discount,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isActive: isActive !== undefined ? isActive : true,
        },
      });

      return {
        message: 'Tạo khuyến mãi thành công',
        data: promotion,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Mã khuyến mãi đã tồn tại');
        }
      }
      throw error;
    }
  }

  async findAll() {
    const promotions = await this.prisma.promotion.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Lấy danh sách khuyến mãi thành công',
      data: promotions,
    };
  }

  async findOne(id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!promotion) {
      throw new NotFoundException('Khuyến mãi không tồn tại');
    }

    return {
      message: 'Lấy thông tin khuyến mãi thành công',
      data: promotion,
    };
  }

  async update(id: string, updatePromotionDto: UpdatePromotionDto) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!promotion) {
      throw new NotFoundException('Khuyến mãi không tồn tại');
    }

    try {
      const { code, description, discount, startDate, endDate, isActive } =
        updatePromotionDto;

      if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
        throw new BadRequestException(
          'Ngày bắt đầu phải nhỏ hơn ngày kết thúc'
        );
      }

      const updatedPromotion = await this.prisma.promotion.update({
        where: { id },
        data: {
          code: code || undefined,
          description: description !== undefined ? description : undefined,
          discount: discount || undefined,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          isActive: isActive !== undefined ? isActive : undefined,
        },
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      });

      // Đồng bộ giá giảm cho tất cả sản phẩm liên quan
      const productIds = updatedPromotion.products.map(p => p.productId);
      await Promise.all(
        productIds.map(productId =>
          this.productsService.syncDiscountedPriceForProduct(productId)
        )
      );

      return {
        message: 'Cập nhật khuyến mãi thành công',
        data: updatedPromotion,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Mã khuyến mãi đã tồn tại');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!promotion) {
      throw new NotFoundException('Khuyến mãi không tồn tại');
    }

    try {
      // Lấy danh sách sản phẩm liên quan để đồng bộ giá sau khi xóa
      const productIds = promotion.products.map(p => p.productId);

      // Xóa các liên kết trong ProductPromotion
      await this.prisma.productPromotion.deleteMany({
        where: { promotionId: id },
      });

      // Xóa khuyến mãi
      await this.prisma.promotion.delete({
        where: { id },
      });

      // Đồng bộ giá giảm cho các sản phẩm bị ảnh hưởng
      await Promise.all(
        productIds.map(productId =>
          this.productsService.syncDiscountedPriceForProduct(productId)
        )
      );

      return {
        message: 'Xóa khuyến mãi thành công',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Không thể xóa khuyến mãi vì có dữ liệu liên quan'
          );
        }
      }
      throw error;
    }
  }

  async addProductToPromotion(
    id: string,
    addProductToPromotionDto: AddProductToPromotionDto
  ) {
    const { productId } = addProductToPromotionDto;

    const promotion = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promotion) {
      throw new NotFoundException('Khuyến mãi không tồn tại');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const existingProductPromotion =
      await this.prisma.productPromotion.findUnique({
        where: {
          productId_promotionId: {
            productId,
            promotionId: id,
          },
        },
      });

    if (existingProductPromotion) {
      throw new BadRequestException(
        'Sản phẩm đã được liên kết với khuyến mãi này'
      );
    }

    const productPromotion = await this.prisma.productPromotion.create({
      data: {
        productId,
        promotionId: id,
      },
      include: {
        product: true,
      },
    });

    // Đồng bộ giá giảm cho sản phẩm vừa thêm
    await this.productsService.syncDiscountedPriceForProduct(productId);

    return {
      message: 'Thêm sản phẩm vào khuyến mãi thành công',
      data: productPromotion,
    };
  }

  async removeProductFromPromotion(id: string, productId: string) {
    const promotion = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promotion) {
      throw new NotFoundException('Khuyến mãi không tồn tại');
    }

    const productPromotion = await this.prisma.productPromotion.findUnique({
      where: {
        productId_promotionId: {
          productId,
          promotionId: id,
        },
      },
    });

    if (!productPromotion) {
      throw new NotFoundException(
        'Sản phẩm không được liên kết với khuyến mãi này'
      );
    }

    await this.prisma.productPromotion.delete({
      where: {
        productId_promotionId: {
          productId,
          promotionId: id,
        },
      },
    });

    // Đồng bộ giá giảm cho sản phẩm vừa xóa
    await this.productsService.syncDiscountedPriceForProduct(productId);

    return {
      message: 'Xóa sản phẩm khỏi khuyến mãi thành công',
    };
  }
}
