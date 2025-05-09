import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  public async calculateDiscountedPrice(
    price: number,
    productId?: string
  ): Promise<number> {
    if (!productId) {
      return price;
    }

    const promotions = await this.prisma.productPromotion.findMany({
      where: { productId },
      include: { promotion: true },
    });

    const now = new Date();
    const activePromotion = promotions.find(({ promotion }) => {
      const startDate = new Date(promotion.startDate);
      const endDate = new Date(promotion.endDate);
      return promotion.isActive && startDate <= now && now <= endDate;
    });

    if (activePromotion) {
      const discount = activePromotion.promotion.discount || 0;
      return Math.max(0, price - discount);
    }
    return price;
  }

  async create(createProductDto: CreateProductDto) {
    const {
      name,
      price,
      storage,
      ram,
      screenSize,
      battery,
      chip,
      operatingSystem,
      modelId,
      files,
    } = createProductDto;

    const model = await this.prisma.model.findUnique({
      where: { id: modelId },
    });
    if (!model) {
      throw new NotFoundException('Model không tồn tại');
    }

    try {
      const slug =
        name.toLowerCase().replace(/\s+/g, '-') + '-' + storage + 'gb';

      const product = await this.prisma.product.create({
        data: {
          name,
          slug,
          price,
          storage,
          ram,
          screenSize,
          battery,
          chip,
          operatingSystem,
          modelId,
        },
      });

      if (files && files.length > 0) {
        const filePromises = files.map(async (file, index) => {
          const uploadResult = await this.cloudinaryService.uploadFile(file);
          const fileRecord = await this.prisma.file.create({
            data: {
              url: uploadResult.secure_url,
              public_id: uploadResult.public_id,
              file_type: 'image',
              size: uploadResult.bytes,
              uploaded_at: new Date(),
            },
          });

          await this.prisma.productFiles.create({
            data: {
              productId: product.id,
              fileId: fileRecord.id,
              isMain: index === 0,
            },
          });

          return fileRecord;
        });

        await Promise.all(filePromises);
      }

      const createdProduct = await this.prisma.product.findUnique({
        where: { id: product.id },
        include: {
          model: { include: { brand: true } },
          productFiles: { include: { file: true } },
          promotions: { include: { promotion: true } },
        },
      });

      // Tính discountedPrice động khi trả về
      const discountedPrice = await this.calculateDiscountedPrice(
        createdProduct.price,
        createdProduct.id
      );

      return {
        message: 'Tạo sản phẩm thành công',
        data: {
          ...createdProduct,
          discountedPrice,
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Slug sản phẩm đã tồn tại');
        }
      }
      throw error;
    }
  }

  async findAll(
    brandSlug?: string,
    modelSlug?: string,
    page: number = 1,
    limit: number = 12
  ) {
    const where: Prisma.ProductWhereInput = {
      model: {},
    };

    if (brandSlug) {
      where.model.brand = {
        slug: brandSlug,
      };
    }

    if (modelSlug) {
      where.model.slug = modelSlug;
    }

    if (!brandSlug && !modelSlug) {
      delete where.model;
    }

    // Tính tổng số sản phẩm để hỗ trợ phân trang
    const totalProducts = await this.prisma.product.count({ where });

    // Tính toán phân trang
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await this.prisma.product.findMany({
      where,
      include: {
        model: {
          include: { brand: true },
        },
        productFiles: {
          include: { file: true },
        },
        promotions: {
          include: {
            promotion: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Tính discountedPrice động cho từng sản phẩm
    const productsWithDiscountedPrice = await Promise.all(
      products.map(async product => {
        const discountedPrice = await this.calculateDiscountedPrice(
          product.price,
          product.id
        );
        return {
          ...product,
          discountedPrice,
        };
      })
    );

    return {
      message: 'Lấy danh sách sản phẩm thành công',
      data: productsWithDiscountedPrice,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        model: {
          include: { brand: true },
        },
        productFiles: {
          include: { file: true },
        },
        productIdentities: true,
        promotions: {
          include: {
            promotion: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    // Tính discountedPrice động
    const discountedPrice = await this.calculateDiscountedPrice(
      product.price,
      product.id
    );

    return {
      message: 'Lấy thông tin sản phẩm thành công',
      data: {
        ...product,
        discountedPrice,
      },
    };
  }

  async findSimilar(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const priceDifference = 4000000;
    const minPrice = product.price - priceDifference;
    const maxPrice = product.price + priceDifference;

    const similarProducts = await this.prisma.product.findMany({
      where: {
        id: { not: id },
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
      include: {
        model: {
          include: { brand: true },
        },
        productFiles: {
          include: { file: true },
        },
        promotions: {
          include: {
            promotion: true,
          },
        },
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });

    // Tính discountedPrice động cho từng sản phẩm
    const similarProductsWithDiscountedPrice = await Promise.all(
      similarProducts.map(async product => {
        const discountedPrice = await this.calculateDiscountedPrice(
          product.price,
          product.id
        );
        return {
          ...product,
          discountedPrice,
        };
      })
    );

    return {
      message: 'Lấy danh sách sản phẩm tương tự thành công',
      data: similarProductsWithDiscountedPrice,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { productFiles: { include: { file: true } } },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const {
      name,
      price,
      storage,
      ram,
      screenSize,
      battery,
      chip,
      operatingSystem,
      modelId,
      files,
      filesToDelete,
    } = updateProductDto;

    if (modelId) {
      const model = await this.prisma.model.findUnique({
        where: { id: modelId },
      });
      if (!model) {
        throw new NotFoundException('Model không tồn tại');
      }
    }

    const hasChanges =
      name !== undefined ||
      price !== undefined ||
      storage !== undefined ||
      ram !== undefined ||
      screenSize !== undefined ||
      battery !== undefined ||
      chip !== undefined ||
      operatingSystem !== undefined ||
      modelId !== undefined ||
      (files && files.length > 0) ||
      (filesToDelete && filesToDelete.length > 0);

    if (!hasChanges) {
      return {
        message: 'Không có thay đổi để cập nhật',
        data: product,
      };
    }

    try {
      const slug =
        name && storage
          ? name.toLowerCase().replace(/\s+/g, '-') + '-' + storage + 'gb'
          : undefined;

      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          name: name || undefined,
          slug: slug || undefined,
          price: price || undefined,
          storage: storage || undefined,
          ram: ram || undefined,
          screenSize: screenSize || undefined,
          battery: battery || undefined,
          chip: chip || undefined,
          operatingSystem: operatingSystem || undefined,
          modelId: modelId || undefined,
        },
      });

      if (filesToDelete && filesToDelete.length > 0) {
        const deletePromises = filesToDelete.map(async fileId => {
          const productFile = await this.prisma.productFiles.findUnique({
            where: {
              productId_fileId: {
                productId: product.id,
                fileId,
              },
            },
            include: { file: true },
          });

          if (productFile) {
            await this.cloudinaryService.deleteFile(productFile.file.public_id);
            await this.prisma.productFiles.delete({
              where: {
                productId_fileId: {
                  productId: product.id,
                  fileId,
                },
              },
            });
            await this.prisma.file.delete({
              where: { id: fileId },
            });
          }
        });

        await Promise.all(deletePromises);
      }

      if (files && files.length > 0) {
        const filePromises = files.map(async (file, index) => {
          const uploadResult = await this.cloudinaryService.uploadFile(file);
          const fileRecord = await this.prisma.file.create({
            data: {
              url: uploadResult.secure_url,
              public_id: uploadResult.public_id,
              file_type: 'image',
              size: uploadResult.bytes,
              uploaded_at: new Date(),
            },
          });

          await this.prisma.productFiles.create({
            data: {
              productId: product.id,
              fileId: fileRecord.id,
              isMain: product.productFiles.length === 0 && index === 0,
            },
          });

          return fileRecord;
        });

        await Promise.all(filePromises);
      }

      const finalProduct = await this.prisma.product.findUnique({
        where: { id: updatedProduct.id },
        include: {
          model: { include: { brand: true } },
          productFiles: { include: { file: true } },
          promotions: { include: { promotion: true } },
        },
      });

      // Tính discountedPrice động
      const discountedPrice = await this.calculateDiscountedPrice(
        finalProduct.price,
        finalProduct.id
      );

      return {
        message: 'Cập nhật sản phẩm thành công',
        data: {
          ...finalProduct,
          discountedPrice,
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Slug sản phẩm đã tồn tại');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { productFiles: { include: { file: true } } },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    try {
      const deletePromises = product.productFiles.map(async productFile => {
        await this.cloudinaryService.deleteFile(productFile.file.public_id);
        await this.prisma.productFiles.delete({
          where: {
            productId_fileId: {
              productId: product.id,
              fileId: productFile.fileId,
            },
          },
        });
        await this.prisma.file.delete({
          where: { id: productFile.fileId },
        });
      });

      await Promise.all(deletePromises);

      await this.prisma.product.delete({
        where: { id },
      });

      return {
        message: 'Xóa sản phẩm thành công',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Không thể xóa sản phẩm vì có dữ liệu liên quan'
          );
        }
      }
      throw error;
    }
  }

  async removeFile(productId: string, fileId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const productFile = await this.prisma.productFiles.findUnique({
      where: {
        productId_fileId: {
          productId,
          fileId,
        },
      },
      include: { file: true },
    });

    if (!productFile) {
      throw new NotFoundException('File không tồn tại');
    }

    try {
      await this.cloudinaryService.deleteFile(productFile.file.public_id);
      await this.prisma.productFiles.delete({
        where: {
          productId_fileId: {
            productId,
            fileId,
          },
        },
      });
      await this.prisma.file.delete({
        where: { id: fileId },
      });

      return {
        message: 'Xóa file thành công',
      };
    } catch (error) {
      throw new BadRequestException('Lỗi khi xóa file');
    }
  }
}
