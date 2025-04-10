// backend/src/models/dto/create-model.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModelDto {
  @ApiProperty({ description: 'Tên của model', example: 'iPhone 14' })
  @IsString({ message: 'Tên model phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên model không được để trống' })
  name: string;

  @ApiProperty({ description: 'ID của thương hiệu', example: 'uuid-of-brand' })
  @IsString({ message: 'Brand ID phải là chuỗi' })
  @IsNotEmpty({ message: 'Brand ID không được để trống' })
  brandId: string;
}
