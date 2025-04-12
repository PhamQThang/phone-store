// src/auth/auth.service.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });
    if (!role) {
      throw new BadRequestException('Role không tồn tại');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async prisma => {
      const newUser = await prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          address: dto.address,
          phoneNumber: dto.phoneNumber,
          roleId: dto.roleId,
        },
      });

      await prisma.cart.create({
        data: {
          userId: newUser.id,
        },
      });

      return newUser;
    });

    const payload = { sub: user.id, email: user.email, role: role.name };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Đăng ký thành công',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        phoneNumber: user.phoneNumber,
        role: role.name,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true, cart: true },
    });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = { sub: user.id, email: user.email, role: user.role.name };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Đăng nhập thành công',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        phoneNumber: user.phoneNumber,
        role: user.role.name,
        cartId: user.cart?.id,
      },
    };
  }

  async logout(token: string) {
    const existingToken = await this.prisma.blacklistToken.findUnique({
      where: { token },
    });

    if (existingToken) {
      throw new BadRequestException('Token đã được vô hiệu hóa trước đó');
    }

    const decoded = this.jwtService.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);

    await this.prisma.blacklistToken.create({
      data: {
        token,
        expiresAt,
      },
    });

    return {
      message: 'Đăng xuất thành công',
    };
  }
}
