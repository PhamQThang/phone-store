import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký người dùng mới' })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công',
    schema: {
      example: {
        message: 'Đăng ký thành công',
        accessToken: 'jwt-token-here',
        user: {
          id: 1,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Đường Láng, Đống Đa, Hà Nội',
          phoneNumber: '0912345678',
          role: 'USER',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email đã tồn tại hoặc dữ liệu không hợp lệ',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Đăng nhập người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công',
    schema: {
      example: {
        message: 'Đăng nhập thành công',
        accessToken: 'jwt-token-here',
        user: {
          id: 1,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Đường Láng, Đống Đa, Hà Nội',
          phoneNumber: '0912345678',
          role: 'USER',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không đúng' })
  @ApiResponse({
    status: 401,
    description: 'Tài khoản của bạn đã bị vô hiệu hóa',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Đăng xuất người dùng' })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
  @ApiResponse({
    status: 400,
    description: 'Token đã được vô hiệu hóa trước đó',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async logout(@Request() req) {
    const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ header
    if (!token) {
      throw new BadRequestException('Token không được cung cấp');
    }
    return this.authService.logout(token);
  }
}
