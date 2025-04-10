// backend/src/products/dto/create-product.dto.ts
import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    description: 'Tên của sản phẩm',
    example: 'iPhone 14 Pro Max 256GB',
  })
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name: string;

  @ApiProperty({ description: 'Giá của sản phẩm', example: 29990000 })
  @Type(() => Number) // Chuyển đổi từ string sang number
  @IsInt({ message: 'Giá phải là số nguyên' })
  @Min(0, { message: 'Giá không được nhỏ hơn 0' })
  @IsNotEmpty({ message: 'Giá không được để trống' })
  price: number;

  @ApiProperty({ description: 'Dung lượng lưu trữ (GB)', example: 256 })
  @Type(() => Number) // Chuyển đổi từ string sang number
  @IsInt({ message: 'Dung lượng lưu trữ phải là số nguyên' })
  @Min(0, { message: 'Dung lượng lưu trữ không được nhỏ hơn 0' })
  @IsNotEmpty({ message: 'Dung lượng lưu trữ không được để trống' })
  storage: number;

  @ApiProperty({ description: 'Dung lượng RAM (GB)', example: 6 })
  @Type(() => Number) // Chuyển đổi từ string sang number
  @IsInt({ message: 'RAM phải là số nguyên' })
  @Min(0, { message: 'RAM không được nhỏ hơn 0' })
  @IsNotEmpty({ message: 'RAM không được để trống' })
  ram: number;

  @ApiProperty({ description: 'ID của model', example: 'uuid-of-model' })
  @IsString({ message: 'Model ID phải là chuỗi' })
  @IsNotEmpty({ message: 'Model ID không được để trống' })
  modelId: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'file', // Sửa thành type: 'file' để Swagger hiểu đây là file upload
      format: 'binary',
    },
    description: 'Danh sách file ảnh',
  })
  files?: Express.Multer.File[];
}
