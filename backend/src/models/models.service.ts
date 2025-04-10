// backend/src/models/models.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ModelsService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo một model mới
  async create(createModelDto: CreateModelDto) {
    const { name, brandId } = createModelDto;

    // Kiểm tra brand có tồn tại không
    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
    });
    if (!brand) {
      throw new NotFoundException('Thương hiệu không tồn tại');
    }

    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-');

      const model = await this.prisma.model.create({
        data: {
          name,
          slug,
          brandId,
        },
      });

      return {
        message: 'Tạo model thành công',
        data: model,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Tên model đã tồn tại trong thương hiệu này'
          );
        }
      }
      throw error;
    }
  }

  // Lấy danh sách tất cả các model
  async findAll() {
    const models = await this.prisma.model.findMany({
      include: { brand: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Lấy danh sách model thành công',
      data: models,
    };
  }

  // Lấy thông tin chi tiết của một model theo ID
  async findOne(id: string) {
    const model = await this.prisma.model.findUnique({
      where: { id },
      include: { brand: true },
    });

    if (!model) {
      throw new NotFoundException('Model không tồn tại');
    }

    return {
      message: 'Lấy thông tin model thành công',
      data: model,
    };
  }

  // Cập nhật thông tin của một model
  async update(id: string, updateModelDto: UpdateModelDto) {
    const model = await this.prisma.model.findUnique({
      where: { id },
    });

    if (!model) {
      throw new NotFoundException('Model không tồn tại');
    }

    const { name, brandId } = updateModelDto;

    if (brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: brandId },
      });
      if (!brand) {
        throw new NotFoundException('Thương hiệu không tồn tại');
      }
    }

    try {
      const slug = name ? name.toLowerCase().replace(/\s+/g, '-') : undefined;

      const updatedModel = await this.prisma.model.update({
        where: { id },
        data: {
          name: name || undefined,
          slug: slug || undefined,
          brandId: brandId || undefined,
        },
      });

      return {
        message: 'Cập nhật model thành công',
        data: updatedModel,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Tên model đã tồn tại trong thương hiệu này'
          );
        }
      }
      throw error;
    }
  }

  // Xóa một model
  async remove(id: string) {
    const model = await this.prisma.model.findUnique({
      where: { id },
    });

    if (!model) {
      throw new NotFoundException('Model không tồn tại');
    }

    try {
      await this.prisma.model.delete({
        where: { id },
      });

      return {
        message: 'Xóa model thành công',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Không thể xóa model vì có sản phẩm liên quan'
          );
        }
      }
      throw error;
    }
  }
}
