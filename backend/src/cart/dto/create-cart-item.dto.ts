// src/cart/dto/create-cart-item.dto.ts
import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartItemDto {
  @ApiProperty({
    description: 'ID của sản phẩm',
    example: 'product-1',
  })
  @IsString({ message: 'ID sản phẩm phải là chuỗi' })
  @IsNotEmpty({ message: 'ID sản phẩm không được để trống' })
  productId: string;

  @ApiProperty({
    description: 'ID của màu sắc',
    example: 'color-1',
  })
  @IsString({ message: 'ID màu sắc phải là chuỗi' })
  @IsNotEmpty({ message: 'ID màu sắc không được để trống' })
  colorId: string;

  @ApiProperty({
    description: 'Số lượng sản phẩm',
    example: 2,
  })
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng phải lớn hơn hoặc bằng 1' })
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  quantity: number;
}
