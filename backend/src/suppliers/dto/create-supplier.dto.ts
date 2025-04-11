// backend/src/suppliers/dto/create-supplier.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ description: 'Tên của nhà cung cấp', example: 'Công ty ABC' })
  @IsString({ message: 'Tên nhà cung cấp phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên nhà cung cấp không được để trống' })
  name: string;

  @ApiProperty({
    description: 'Địa chỉ của nhà cung cấp',
    example: '123 Đường Láng, Hà Nội',
  })
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address: string;

  @ApiProperty({
    description: 'Số điện thoại của nhà cung cấp',
    example: '0901234567',
  })
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @Matches(/^[0-9]{10,11}$/, {
    message: 'Số điện thoại phải có 10-11 chữ số và chỉ chứa số',
  })
  phone: string;

  @ApiProperty({
    description: 'Email của nhà cung cấp',
    example: 'abc@company.com',
    required: false,
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  email?: string;
}
