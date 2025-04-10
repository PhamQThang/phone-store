// backend/src/purchase-orders/dto/create-purchase-order.dto.ts
import { IsNotEmpty, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PurchaseOrderDetailDto } from './purchase-order-detail.dto';

export class CreatePurchaseOrderDto {
  @ApiProperty({
    description: 'ID của nhà cung cấp',
    example: 'uuid-of-supplier',
  })
  @IsString({ message: 'Supplier ID phải là chuỗi' })
  @IsNotEmpty({ message: 'Supplier ID không được để trống' })
  supplierId: string;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Đơn nhập hàng tháng 4',
    required: false,
  })
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string;

  @ApiProperty({
    type: [PurchaseOrderDetailDto],
    description: 'Danh sách chi tiết đơn nhập hàng',
  })
  @IsArray({ message: 'Danh sách chi tiết đơn nhập hàng phải là mảng' })
  @IsNotEmpty({
    message: 'Danh sách chi tiết đơn nhập hàng không được để trống',
  })
  details: PurchaseOrderDetailDto[];
}
