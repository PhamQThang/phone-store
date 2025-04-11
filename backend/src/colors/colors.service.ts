// backend/src/colors/colors.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ColorsService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo một màu mới
  async create(createColorDto: CreateColorDto) {
    try {
      const { name } = createColorDto;

      const color = await this.prisma.color.create({
        data: {
          name,
        },
      });

      return {
        message: 'Tạo màu thành công',
        data: color,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Tên màu đã tồn tại');
        }
      }
      throw error;
    }
  }

  // Lấy danh sách tất cả các màu
  async findAll() {
    const colors = await this.prisma.color.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Lấy danh sách màu thành công',
      data: colors,
    };
  }

  // Lấy thông tin chi tiết của một màu theo ID
  async findOne(id: string) {
    const color = await this.prisma.color.findUnique({
      where: { id },
      include: {
        productIdentities: true, // Bao gồm các productIdentities liên quan
        orderDetails: true, // Bao gồm các orderDetails liên quan
        purchaseOrderDetails: true, // Bao gồm các purchaseOrderDetails liên quan
      },
    });

    if (!color) {
      throw new NotFoundException('Màu không tồn tại');
    }

    return {
      message: 'Lấy thông tin màu thành công',
      data: color,
    };
  }

  // Cập nhật thông tin của một màu
  async update(id: string, updateColorDto: UpdateColorDto) {
    const color = await this.prisma.color.findUnique({
      where: { id },
    });

    if (!color) {
      throw new NotFoundException('Màu không tồn tại');
    }

    try {
      const updatedColor = await this.prisma.color.update({
        where: { id },
        data: {
          name: updateColorDto.name || undefined,
        },
      });

      return {
        message: 'Cập nhật màu thành công',
        data: updatedColor,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Tên màu đã tồn tại');
        }
      }
      throw error;
    }
  }

  // Xóa một màu
  async remove(id: string) {
    const color = await this.prisma.color.findUnique({
      where: { id },
    });

    if (!color) {
      throw new NotFoundException('Màu không tồn tại');
    }

    try {
      await this.prisma.color.delete({
        where: { id },
      });

      return {
        message: 'Xóa màu thành công',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Không thể xóa màu vì có dữ liệu liên quan (sản phẩm, đơn hàng, hoặc đơn nhập hàng)'
          );
        }
      }
      throw error;
    }
  }
}
