// backend/src/brands/brands.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo một brand mới
  async create(createBrandDto: CreateBrandDto) {
    try {
      const { name } = createBrandDto;

      // Tạo slug từ name
      const slug = name.toLowerCase().replace(/\s+/g, '-');

      const brand = await this.prisma.brand.create({
        data: {
          name,
          slug,
        },
      });

      return {
        message: 'Tạo thương hiệu thành công',
        data: brand,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Tên thương hiệu đã tồn tại');
        }
      }
      throw error;
    }
  }

  // Lấy danh sách tất cả các brand
  async findAll() {
    const brands = await this.prisma.brand.findMany({
      include: { models: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Lấy danh sách thương hiệu thành công',
      data: brands,
    };
  }

  // Lấy thông tin chi tiết của một brand theo ID
  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { models: true },
    });

    if (!brand) {
      throw new NotFoundException('Thương hiệu không tồn tại');
    }

    return {
      message: 'Lấy thông tin thương hiệu thành công',
      data: brand,
    };
  }

  // Cập nhật thông tin của một brand
  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('Thương hiệu không tồn tại');
    }

    try {
      const { name } = updateBrandDto;
      const slug = name ? name.toLowerCase().replace(/\s+/g, '-') : undefined;

      const updatedBrand = await this.prisma.brand.update({
        where: { id },
        data: {
          name: name || undefined,
          slug: slug || undefined,
        },
      });

      return {
        message: 'Cập nhật thương hiệu thành công',
        data: updatedBrand,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Tên thương hiệu đã tồn tại');
        }
      }
      throw error;
    }
  }

  // Xóa một brand
  async remove(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('Thương hiệu không tồn tại');
    }

    try {
      await this.prisma.brand.delete({
        where: { id },
      });

      return {
        message: 'Xóa thương hiệu thành công',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Không thể xóa thương hiệu vì có model liên quan'
          );
        }
      }
      throw error;
    }
  }
}
