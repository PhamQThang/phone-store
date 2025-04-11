// backend/src/purchase-orders/dto/purchase-order-detail.dto.ts
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseOrderDetailDto {
  @ApiProperty({
    description: 'ID của chi tiết đơn nhập hàng (dùng khi chỉnh sửa)',
    example: '3d07507a-3851-4191-a73b-9bff77ab7de8',
    required: false,
  })
  @IsString({ message: 'ID phải là chuỗi' })
  @IsNotEmpty({ message: 'ID không được để trống (khi chỉnh sửa)' })
  id?: string; // Thêm trường id (tùy chọn, dùng khi chỉnh sửa)

  @ApiProperty({
    description: 'ID của sản phẩm',
    example: '2cb0a233-cae6-4038-b5bf-8be3f8ccf4e8',
  })
  @IsString({ message: 'ID sản phẩm phải là chuỗi' })
  @IsNotEmpty({ message: 'ID sản phẩm không được để trống' })
  productId: string;

  @ApiProperty({
    description: 'ID của màu sắc',
    example: 'e07a4e42-014c-4b1d-880d-d29c5e9aa831',
  })
  @IsString({ message: 'ID màu sắc phải là chuỗi' })
  @IsNotEmpty({ message: 'ID màu sắc không được để trống' })
  colorId: string;

  @ApiProperty({
    description: 'Giá nhập của sản phẩm',
    example: 20000000,
  })
  @IsNumber({}, { message: 'Giá nhập phải là số' })
  @IsNotEmpty({ message: 'Giá nhập không được để trống' })
  importPrice: number;

  @ApiProperty({
    description: 'IMEI của sản phẩm',
    example: 'FX01',
  })
  @IsString({ message: 'IMEI phải là chuỗi' })
  @IsNotEmpty({ message: 'IMEI không được để trống' })
  imei: string;
}
