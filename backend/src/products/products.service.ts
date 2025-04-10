// backend/src/products/products.service.ts
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

  // Tạo một sản phẩm mới
  async create(createProductDto: CreateProductDto) {
    const { name, price, storage, ram, modelId, files } = createProductDto;

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

      // Tạo sản phẩm
      const product = await this.prisma.product.create({
        data: {
          name,
          slug,
          price,
          storage,
          ram,
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

  // Lấy danh sách tất cả các sản phẩm
  async findAll() {
    const products = await this.prisma.product.findMany({
      include: {
        model: {
          include: { brand: true },
        },
        productFiles: {
          include: { file: true },
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

  // Cập nhật thông tin của một sản phẩm
  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { productFiles: { include: { file: true } } },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const { name, price, storage, ram, modelId, files } = updateProductDto;

    if (modelId) {
      const model = await this.prisma.model.findUnique({
        where: { id: modelId },
      });
      if (!model) {
        throw new NotFoundException('Model không tồn tại');
      }
    }

    try {
      const slug =
        name && storage
          ? name.toLowerCase().replace(/\s+/g, '-') + '-' + storage + 'gb'
          : undefined;

      // Cập nhật sản phẩm
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          name: name || undefined,
          slug: slug || undefined,
          price: price || undefined,
          storage: storage || undefined,
          ram: ram || undefined,
          modelId: modelId || undefined,
        },
      });

      // Upload ảnh mới nếu có
      if (files && files.length > 0) {
        // Xóa các ảnh cũ trên Cloudinary và trong database
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

        // Upload ảnh mới
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

      // Lấy lại sản phẩm với thông tin đầy đủ
      const finalProduct = await this.prisma.product.findUnique({
        where: { id: updatedProduct.id },
        include: {
          model: { include: { brand: true } },
          productFiles: { include: { file: true } },
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
}
