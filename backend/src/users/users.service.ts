// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy thông tin người dùng
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Không trả về mật khẩu
    const { password: _, ...result } = user;
    return result;
  }

  // Cập nhật thông tin người dùng
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: { role: true },
    });

    const { password: _, ...result } = updatedUser;
    return result;
  }

  // Xóa người dùng (chỉ admin)
  async remove(id: number, currentUserId: number) {
    // Kiểm tra xem người dùng có tồn tại không
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Không cho phép người dùng tự xóa chính mình
    if (id === currentUserId) {
      throw new BadRequestException('Bạn không thể tự xóa chính mình');
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: 'Người dùng đã được xóa' };
  }

  // Lấy tất cả người dùng (chỉ admin)
  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { role: true },
    });

    // Không trả về mật khẩu
    return users.map(user => {
      const { password: _, ...result } = user;
      return result;
    });
  }
}
