// backend/src/brands/dto/create-brand.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ description: 'Tên của thương hiệu', example: 'Apple' })
  @IsString({ message: 'Tên thương hiệu phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên thương hiệu không được để trống' })
  name: string;
}
