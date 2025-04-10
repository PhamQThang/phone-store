// backend/src/suppliers/suppliers.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo một nhà cung cấp mới
  async create(createSupplierDto: CreateSupplierDto) {
    try {
      const { name, address, phone, email } = createSupplierDto;

      const supplier = await this.prisma.supplier.create({
        data: {
          name,
          address,
          phone,
          email,
        },
      });

      return {
        message: 'Tạo nhà cung cấp thành công',
        data: supplier,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Số điện thoại đã tồn tại');
        }
      }
      throw error;
    }
  }

  // Lấy danh sách tất cả các nhà cung cấp
  async findAll() {
    const suppliers = await this.prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Lấy danh sách nhà cung cấp thành công',
      data: suppliers,
    };
  }

  // Lấy thông tin chi tiết của một nhà cung cấp theo ID
  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: { purchaseOrders: true }, // Bao gồm các đơn nhập hàng liên quan
    });

    if (!supplier) {
      throw new NotFoundException('Nhà cung cấp không tồn tại');
    }

    return {
      message: 'Lấy thông tin nhà cung cấp thành công',
      data: supplier,
    };
  }

  // Cập nhật thông tin của một nhà cung cấp
  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException('Nhà cung cấp không tồn tại');
    }

    try {
      const updatedSupplier = await this.prisma.supplier.update({
        where: { id },
        data: {
          name: updateSupplierDto.name || undefined,
          address: updateSupplierDto.address || undefined,
          phone: updateSupplierDto.phone || undefined,
          email: updateSupplierDto.email || undefined,
        },
      });

      return {
        message: 'Cập nhật nhà cung cấp thành công',
        data: updatedSupplier,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Số điện thoại đã tồn tại');
        }
      }
      throw error;
    }
  }

  // Xóa một nhà cung cấp
  async remove(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException('Nhà cung cấp không tồn tại');
    }

    try {
      await this.prisma.supplier.delete({
        where: { id },
      });

      return {
        message: 'Xóa nhà cung cấp thành công',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Không thể xóa nhà cung cấp vì có đơn nhập hàng liên quan'
          );
        }
      }
      throw error;
    }
  }
}
