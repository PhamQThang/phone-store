// backend/src/suppliers/dto/update-supplier.dto.ts
import { IsOptional, IsString, IsEmail, Matches } from 'class-validator';
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
    example: '0901234567',
    required: false,
  })
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @Matches(/^[0-9]{10,11}$/, {
    message: 'Số điện thoại phải có 10-11 chữ số và chỉ chứa số',
  })
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
