// backend/src/purchase-orders/dto/purchase-order-detail.dto.ts
import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PurchaseOrderDetailDto {
  @ApiProperty({ description: 'ID của sản phẩm', example: 'uuid-of-product' })
  @IsString({ message: 'Product ID phải là chuỗi' })
  @IsNotEmpty({ message: 'Product ID không được để trống' })
  productId: string;

  @ApiProperty({ description: 'ID của màu sắc', example: 'uuid-of-color' })
  @IsString({ message: 'Color ID phải là chuỗi' })
  @IsNotEmpty({ message: 'Color ID không được để trống' })
  colorId: string;

  @ApiProperty({
    description: 'Mã IMEI của sản phẩm',
    example: '123456789012345',
  })
  @IsString({ message: 'IMEI phải là chuỗi' })
  @IsNotEmpty({ message: 'IMEI không được để trống' })
  imei: string;

  @ApiProperty({ description: 'Giá nhập của sản phẩm', example: 25000000 })
  @Type(() => Number)
  @IsInt({ message: 'Giá nhập phải là số nguyên' })
  @Min(0, { message: 'Giá nhập không được nhỏ hơn 0' })
  @IsNotEmpty({ message: 'Giá nhập không được để trống' })
  importPrice: number;
}
