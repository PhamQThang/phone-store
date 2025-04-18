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

  // Hàm tính giá sau khi giảm dựa trên khuyến mãi
  public async calculateDiscountedPrice(
    price: number,
    productId?: string
  ): Promise<number> {
    if (!productId) {
      return price; // Khi tạo mới, chưa có khuyến mãi nên trả về giá gốc
    }

    // Lấy danh sách khuyến mãi liên quan đến sản phẩm
    const promotions = await this.prisma.productPromotion.findMany({
      where: { productId },
      include: {
        promotion: true,
      },
    });

    const now = new Date();
    const activePromotion = promotions.find(({ promotion }) => {
      const startDate = new Date(promotion.startDate);
      const endDate = new Date(promotion.endDate);
      return promotion.isActive && startDate <= now && now <= endDate;
    });

    if (activePromotion) {
      const discount = activePromotion.promotion.discount || 0;
      return Math.max(0, price - discount); // Đảm bảo giá không âm
    }
    return price; // Nếu không có khuyến mãi, trả về giá gốc
  }

  // Đồng bộ giá giảm cho một sản phẩm cụ thể
  async syncDiscountedPriceForProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const discountedPrice = await this.calculateDiscountedPrice(
      product.price,
      productId
    );
    await this.prisma.product.update({
      where: { id: productId },
      data: { discountedPrice },
    });
  }

  // Tạo một sản phẩm mới
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

    // Kiểm tra model có tồn tại không
    const model = await this.prisma.model.findUnique({
      where: { id: modelId },
    });
    if (!model) {
      throw new NotFoundException('Model không tồn tại');
    }

    try {
      const slug =
        name.toLowerCase().replace(/\s+/g, '-') + '-' + storage + 'gb';

      // Khi tạo mới, chưa có khuyến mãi nên discountedPrice = price
      const discountedPrice = price;

      // Tạo sản phẩm với các thuộc tính mới
      const product = await this.prisma.product.create({
        data: {
          name,
          slug,
          price,
          discountedPrice, // Lưu giá sau khi giảm (bằng giá gốc ban đầu)
          storage,
          ram,
          screenSize,
          battery,
          chip,
          operatingSystem,
          modelId,
        },
      });

      // Upload ảnh lên Cloudinary và lưu vào bảng File
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

          // Liên kết file với sản phẩm qua bảng ProductFiles
          await this.prisma.productFiles.create({
            data: {
              productId: product.id,
              fileId: fileRecord.id,
              isMain: index === 0, // Ảnh đầu tiên là ảnh chính
            },
          });

          return fileRecord;
        });

        await Promise.all(filePromises);
      }

      // Lấy lại sản phẩm với thông tin đầy đủ
      const createdProduct = await this.prisma.product.findUnique({
        where: { id: product.id },
        include: {
          model: { include: { brand: true } },
          productFiles: { include: { file: true } },
          promotions: { include: { promotion: true } },
        },
      });

      return {
        message: 'Tạo sản phẩm thành công',
        data: createdProduct,
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

  // Lấy danh sách tất cả các sản phẩm, hỗ trợ lọc theo brandSlug và modelSlug
  async findAll(brandSlug?: string, modelSlug?: string) {
    const where: Prisma.ProductWhereInput = {
      model: {},
    };

    // Lọc theo brandSlug
    if (brandSlug) {
      where.model.brand = {
        slug: brandSlug,
      };
    }

    // Lọc theo modelSlug
    if (modelSlug) {
      where.model.slug = modelSlug;
    }

    // Nếu không có điều kiện lọc nào, xóa model để không áp dụng bộ lọc rỗng
    if (!brandSlug && !modelSlug) {
      delete where.model;
    }

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
    });

    return {
      message: 'Lấy danh sách sản phẩm thành công',
      data: products,
    };
  }

  // Lấy thông tin chi tiết của một sản phẩm theo ID
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

    return {
      message: 'Lấy thông tin sản phẩm thành công',
      data: product,
    };
  }

  // Lấy danh sách các sản phẩm tương tự (dựa trên giá gần giống)
  async findSimilar(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        model: {
          include: { brand: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const brandId = product.model.brandId;
    const priceRange = 0.2; // ±20% giá
    const minPrice = product.price * (1 - priceRange);
    const maxPrice = product.price * (1 + priceRange);

    const similarProducts = await this.prisma.product.findMany({
      where: {
        id: { not: id }, // Loại bỏ chính sản phẩm hiện tại
        model: {
          brandId: brandId, // Cùng thương hiệu
        },
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
      take: 4, // Giới hạn tối đa 4 sản phẩm tương tự
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Lấy danh sách sản phẩm tương tự thành công',
      data: similarProducts,
    };
  }

  // Cập nhật thông tin của một sản phẩm
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

    // Kiểm tra nếu không có thay đổi
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

      // Tính giá sau khi giảm (dùng giá mới nếu có, nếu không dùng giá cũ)
      const newPrice = price !== undefined ? price : product.price;
      const discountedPrice = await this.calculateDiscountedPrice(newPrice, id);

      // Cập nhật sản phẩm với các thuộc tính mới
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          name: name || undefined,
          slug: slug || undefined,
          price: price || undefined,
          discountedPrice, // Cập nhật giá sau khi giảm
          storage: storage || undefined,
          ram: ram || undefined,
          screenSize: screenSize || undefined,
          battery: battery || undefined,
          chip: chip || undefined,
          operatingSystem: operatingSystem || undefined,
          modelId: modelId || undefined,
        },
      });

      // Xóa các ảnh được chỉ định trong filesToDelete
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

      // Thêm ảnh mới nếu có
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

          // Liên kết file với sản phẩm qua bảng ProductFiles
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

      // Lấy lại sản phẩm với thông tin đầy đủ
      const finalProduct = await this.prisma.product.findUnique({
        where: { id: updatedProduct.id },
        include: {
          model: { include: { brand: true } },
          productFiles: { include: { file: true } },
          promotions: { include: { promotion: true } },
        },
      });

      return {
        message: 'Cập nhật sản phẩm thành công',
        data: finalProduct,
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

  // Xóa một sản phẩm
  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { productFiles: { include: { file: true } } },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    try {
      // Xóa các ảnh trên Cloudinary và trong database
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

      // Xóa sản phẩm
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
            'Không thể xóa sản phẩm vì có dữ liệu liên quan (product identities, order details, v.v.)'
          );
        }
      }
      throw error;
    }
  }

  // Xóa một file của sản phẩm
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
      // Xóa file trên Cloudinary
      await this.cloudinaryService.deleteFile(productFile.file.public_id);

      // Xóa bản ghi trong ProductFiles
      await this.prisma.productFiles.delete({
        where: {
          productId_fileId: {
            productId,
            fileId,
          },
        },
      });

      // Xóa bản ghi trong File
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
