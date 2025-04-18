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
  Post,
  BadRequestException,
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
    const user = await this.usersService.findOne(userId);
    return {
      message: 'Lấy thông tin người dùng hiện tại thành công',
      data: user,
    };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng hiện tại' })
  @ApiResponse({
    status: 200,
    description:
      'Cập nhật thành công, bao gồm cập nhật mật khẩu nếu được cung cấp',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async updateProfile(
    @User('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const updatedUser = await this.usersService.update(userId, updateUserDto);
    return {
      message: 'Cập nhật thông tin người dùng hiện tại thành công',
      data: updatedUser,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('Admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng (chỉ admin)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      message: 'Lấy danh sách tất cả người dùng thành công',
      data: users,
    };
  }

  @Get('deleted')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('Admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Lấy danh sách người dùng đã bị xóa mềm (chỉ admin)',
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  async findAllDeleted() {
    const deletedUsers = await this.usersService.findAllDeleted();
    return {
      message: 'Lấy danh sách người dùng đã bị xóa mềm thành công',
      data: deletedUsers,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('Admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết một người dùng (chỉ admin)',
  })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  async findOne(@Param('id') id: string) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new BadRequestException('ID không hợp lệ');
    }
    const user = await this.usersService.findOne(userId);
    return {
      message: 'Lấy thông tin chi tiết người dùng thành công',
      data: user,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('Admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật thông tin một người dùng (chỉ admin)' })
  @ApiResponse({
    status: 200,
    description:
      'Cập nhật thành công, bao gồm cập nhật mật khẩu nếu được cung cấp',
  })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new BadRequestException('ID không hợp lệ');
    }
    const updatedUser = await this.usersService.update(userId, updateUserDto);
    return {
      message: 'Cập nhật thông tin người dùng thành công',
      data: updatedUser,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('Admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Xóa mềm người dùng (chỉ admin)' })
  @ApiResponse({ status: 200, description: 'Xóa mềm thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @User('userId') currentUserId: number) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new BadRequestException('ID không hợp lệ');
    }
    const result = await this.usersService.remove(userId, currentUserId);
    return {
      message: result.message,
      data: null,
    };
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('Admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Khôi phục người dùng đã bị xóa mềm (chỉ admin)' })
  @ApiResponse({ status: 200, description: 'Khôi phục thành công' })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  async restore(@Param('id') id: string) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new BadRequestException('ID không hợp lệ');
    }
    const result = await this.usersService.restore(userId);
    return {
      message: result.message,
      data: null,
    };
  }
}
