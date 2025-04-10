// backend/src/products/dto/update-product.dto.ts
import { IsOptional, IsString, IsInt, Min, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @ApiProperty({
    description: 'Tên của sản phẩm',
    example: 'iPhone 14 Pro Max 512GB',
    required: false,
  })
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Giá của sản phẩm',
    example: 32990000,
    required: false,
  })
  @IsInt({ message: 'Giá phải là số nguyên' })
  @Min(0, { message: 'Giá không được nhỏ hơn 0' })
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Dung lượng lưu trữ (GB)',
    example: 512,
    required: false,
  })
  @IsInt({ message: 'Dung lượng lưu trữ phải là số nguyên' })
  @Min(0, { message: 'Dung lượng lưu trữ không được nhỏ hơn 0' })
  @IsOptional()
  storage?: number;

  @ApiProperty({
    description: 'Dung lượng RAM (GB)',
    example: 8,
    required: false,
  })
  @IsInt({ message: 'RAM phải là số nguyên' })
  @Min(0, { message: 'RAM không được nhỏ hơn 0' })
  @IsOptional()
  ram?: number;

  @ApiProperty({
    description: 'ID của model',
    example: 'uuid-of-model',
    required: false,
  })
  @IsString({ message: 'Model ID phải là chuỗi' })
  @IsOptional()
  modelId?: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Danh sách file ảnh',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @Type(() => Object)
  files?: Express.Multer.File[];
}
