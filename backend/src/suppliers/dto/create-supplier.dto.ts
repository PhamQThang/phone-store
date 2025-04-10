// backend/src/suppliers/dto/create-supplier.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
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
    example: '+84987654321',
  })
  @IsPhoneNumber(null, { message: 'Số điện thoại không hợp lệ' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
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
