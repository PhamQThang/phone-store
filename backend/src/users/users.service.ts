import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy thông tin người dùng
  async findOne(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID không hợp lệ');
    }

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
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Mã hóa mật khẩu nếu được cung cấp
    let hashedPassword: string | undefined;
    if (updateUserDto.password) {
      hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        address: updateUserDto.address,
        phoneNumber: updateUserDto.phoneNumber,
        password: hashedPassword, // Cập nhật mật khẩu nếu có
      },
      include: { role: true },
    });

    const { password: _, ...result } = updatedUser;
    return result;
  }

  async remove(id: number, currentUserId: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại hoặc đã bị xóa');
    }

    if (id === currentUserId) {
      throw new BadRequestException('Bạn không thể tự xóa chính mình');
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(), // Lưu thời điểm xóa mềm
      },
    });

    return { message: 'Người dùng đã được xóa mềm' };
  }

  async restore(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id,
        isActive: false,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'Người dùng không tồn tại hoặc chưa bị xóa mềm'
      );
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        deletedAt: null, // Xóa thời điểm xóa mềm
      },
    });

    return { message: 'Người dùng đã được khôi phục' };
  }

  // Lấy danh sách người dùng đã bị xóa mềm (chỉ admin, nếu cần)
  async findAllDeleted() {
    const users = await this.prisma.user.findMany({
      where: {
        isActive: false, // Chỉ lấy người dùng đã bị xóa mềm
      },
      include: { role: true },
    });

    // Không trả về mật khẩu
    return users.map(user => {
      const { password: _, ...result } = user;
      return result;
    });
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
