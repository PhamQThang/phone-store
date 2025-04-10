// backend/src/purchase-orders/dto/update-purchase-order.dto.ts
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum PurchaseOrderStatus {
  Pending = 'Pending',
  Done = 'Done',
  Cancelled = 'Cancelled',
}

export class UpdatePurchaseOrderDto {
  @ApiProperty({
    description: 'Trạng thái của đơn nhập hàng',
    enum: PurchaseOrderStatus,
    example: 'Done',
  })
  @IsEnum(PurchaseOrderStatus, { message: 'Trạng thái không hợp lệ' })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  status: string;
}
