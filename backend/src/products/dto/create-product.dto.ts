// backend/src/products/dto/create-product.dto.ts
import { IsNotEmpty, IsString, IsInt, Min, IsNumber } from 'class-validator';
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
  @Type(() => Number)
  @IsInt({ message: 'Giá phải là số nguyên' })
  @Min(0, { message: 'Giá không được nhỏ hơn 0' })
  @IsNotEmpty({ message: 'Giá không được để trống' })
  price: number;

  @ApiProperty({ description: 'Dung lượng lưu trữ (GB)', example: 256 })
  @Type(() => Number)
  @IsInt({ message: 'Dung lượng lưu trữ phải là số nguyên' })
  @Min(0, { message: 'Dung lượng lưu trữ không được nhỏ hơn 0' })
  @IsNotEmpty({ message: 'Dung lượng lưu trữ không được để trống' })
  storage: number;

  @ApiProperty({ description: 'Dung lượng RAM (GB)', example: 6 })
  @Type(() => Number)
  @IsInt({ message: 'RAM phải là số nguyên' })
  @Min(0, { message: 'RAM không được nhỏ hơn 0' })
  @IsNotEmpty({ message: 'RAM không được để trống' })
  ram: number;

  @ApiProperty({
    description: 'Kích thước màn hình (inch)',
    example: 6.7,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Kích thước màn hình phải là số' }) // Sử dụng IsNumber thay vì IsFloat
  @Min(0, { message: 'Kích thước màn hình không được nhỏ hơn 0' })
  @IsNotEmpty({ message: 'Kích thước màn hình không được để trống' })
  screenSize: number;

  @ApiProperty({
    description: 'Dung lượng pin (mAh)',
    example: 4323,
  })
  @Type(() => Number)
  @IsInt({ message: 'Dung lượng pin phải là số nguyên' })
  @Min(0, { message: 'Dung lượng pin không được nhỏ hơn 0' })
  @IsNotEmpty({ message: 'Dung lượng pin không được để trống' })
  battery: number;

  @ApiProperty({
    description: 'Tên chip',
    example: 'A16 Bionic',
  })
  @IsString({ message: 'Tên chip phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên chip không được để trống' })
  chip: string;

  @ApiProperty({
    description: 'Hệ điều hành',
    example: 'iOS 16',
  })
  @IsString({ message: 'Hệ điều hành phải là chuỗi' })
  @IsNotEmpty({ message: 'Hệ điều hành không được để trống' })
  operatingSystem: string;

  @ApiProperty({ description: 'ID của model', example: 'uuid-of-model' })
  @IsString({ message: 'Model ID phải là chuỗi' })
  @IsNotEmpty({ message: 'Model ID không được để trống' })
  modelId: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'file',
      format: 'binary',
    },
    description: 'Danh sách file ảnh',
  })
  files?: Express.Multer.File[];
}
