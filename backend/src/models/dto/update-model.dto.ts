// backend/src/models/dto/update-model.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateModelDto {
  @ApiProperty({
    description: 'Tên của model',
    example: 'iPhone 15',
    required: false,
  })
  @IsString({ message: 'Tên model phải là chuỗi' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'ID của thương hiệu',
    example: 'uuid-of-brand',
    required: false,
  })
  @IsString({ message: 'Brand ID phải là chuỗi' })
  @IsOptional()
  brandId?: string;
}
