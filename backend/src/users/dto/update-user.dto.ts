import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Tên của người dùng',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Tên phải là chuỗi' })
  firstName?: string;

  @ApiProperty({
    description: 'Họ của người dùng',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Họ phải là chuỗi' })
  lastName?: string;

  @ApiProperty({
    description: 'Địa chỉ của người dùng',
    example: '123 Đường Láng, Đống Đa, Hà Nội',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  address?: string;

  @ApiProperty({
    description: 'Số điện thoại của người dùng',
    example: '0912345678',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Mật khẩu mới của người dùng (ít nhất 5 ký tự)',
    example: 'newpassword123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Mật khẩu phải có ít nhất 5 ký tự' })
  password?: string;
}
