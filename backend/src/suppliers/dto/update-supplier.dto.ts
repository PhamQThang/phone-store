// backend/src/suppliers/dto/update-supplier.dto.ts
import { IsOptional, IsString, IsEmail, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSupplierDto {
  @ApiProperty({
    description: 'Tên của nhà cung cấp',
    example: 'Công ty XYZ',
    required: false,
  })
  @IsString({ message: 'Tên nhà cung cấp phải là chuỗi' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Địa chỉ của nhà cung cấp',
    example: '456 Đường Láng, Hà Nội',
    required: false,
  })
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Số điện thoại của nhà cung cấp',
    example: '+84912345678',
    required: false,
  })
  @IsPhoneNumber(null, { message: 'Số điện thoại không hợp lệ' })
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Email của nhà cung cấp',
    example: 'xyz@company.com',
    required: false,
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  email?: string;
}
