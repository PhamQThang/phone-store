// src/users/users.controller.ts
import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RoleGuard } from 'src/auth/guards/role.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async getProfile(@User('userId') userId: number) {
    // Đổi từ @User('id') thành @User('userId')
    return this.usersService.findOne(userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async updateProfile(
    @User('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    // Đổi từ @User('id') thành @User('userId')
    return this.usersService.update(userId, updateUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('Admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng (chỉ admin)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('Admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Xóa người dùng (chỉ admin)' })
  @ApiResponse({ status: 204, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @User('userId') currentUserId: number) {
    // Đổi từ @User('id') thành @User('userId')
    await this.usersService.remove(parseInt(id), currentUserId);
  }
}
