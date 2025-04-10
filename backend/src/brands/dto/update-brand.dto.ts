// backend/src/brands/dto/update-brand.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBrandDto {
  @ApiProperty({
    description: 'Tên của thương hiệu',
    example: 'Samsung',
    required: false,
  })
  @IsString({ message: 'Tên thương hiệu phải là chuỗi' })
  @IsOptional()
  name?: string;
}
