// backend/src/products/dto/update-product.dto.ts
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsArray,
  IsNumber,
} from 'class-validator';
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
  @Type(() => Number)
  @IsInt({ message: 'Giá phải là số nguyên' })
  @Min(0, { message: 'Giá không được nhỏ hơn 0' })
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Dung lượng lưu trữ (GB)',
    example: 512,
    required: false,
  })
  @Type(() => Number)
  @IsInt({ message: 'Dung lượng lưu trữ phải là số nguyên' })
  @Min(0, { message: 'Dung lượng lưu trữ không được nhỏ hơn 0' })
  @IsOptional()
  storage?: number;

  @ApiProperty({
    description: 'Dung lượng RAM (GB)',
    example: 8,
    required: false,
  })
  @Type(() => Number)
  @IsInt({ message: 'RAM phải là số nguyên' })
  @Min(0, { message: 'RAM không được nhỏ hơn 0' })
  @IsOptional()
  ram?: number;

  @ApiProperty({
    description: 'Kích thước màn hình (inch)',
    example: 6.7,
    required: false,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Kích thước màn hình phải là số' }) // Sử dụng IsNumber thay vì IsFloat
  @Min(0, { message: 'Kích thước màn hình không được nhỏ hơn 0' })
  @IsOptional()
  screenSize?: number;

  @ApiProperty({
    description: 'Dung lượng pin (mAh)',
    example: 4323,
    required: false,
  })
  @Type(() => Number)
  @IsInt({ message: 'Dung lượng pin phải là số nguyên' })
  @Min(0, { message: 'Dung lượng pin không được nhỏ hơn 0' })
  @IsOptional()
  battery?: number;

  @ApiProperty({
    description: 'Tên chip',
    example: 'A16 Bionic',
    required: false,
  })
  @IsString({ message: 'Tên chip phải là chuỗi' })
  @IsOptional()
  chip?: string;

  @ApiProperty({
    description: 'Hệ điều hành',
    example: 'iOS 16',
    required: false,
  })
  @IsString({ message: 'Hệ điều hành phải là chuỗi' })
  @IsOptional()
  operatingSystem?: string;

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
    description: 'Danh sách file ảnh mới',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @Type(() => Object)
  files?: Express.Multer.File[];

  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    description: 'Danh sách fileId của các ảnh cần xóa',
    required: false,
  })
  @IsArray()
  @IsString({ each: true, message: 'Mỗi fileId phải là chuỗi' })
  @IsOptional()
  filesToDelete?: string[];
}
