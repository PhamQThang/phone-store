// backend/src/purchase-orders/dto/update-purchase-order.dto.ts
import {
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PurchaseOrderDetailDto } from './purchase-order-detail.dto';

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

  @ApiProperty({
    type: [PurchaseOrderDetailDto],
    description:
      'Danh sách chi tiết đơn nhập hàng mới (chỉ áp dụng khi trạng thái là Pending)',
    required: false,
  })
  @IsArray({ message: 'Danh sách chi tiết đơn nhập hàng phải là mảng' })
  @IsOptional()
  details?: PurchaseOrderDetailDto[];

  @ApiProperty({
    description:
      'Danh sách ID của chi tiết đơn nhập hàng cần xóa (chỉ áp dụng khi trạng thái là Pending)',
    type: [String],
    required: false,
  })
  @IsArray({ message: 'Danh sách ID cần xóa phải là mảng' })
  @IsString({ each: true, message: 'Mỗi ID phải là chuỗi' })
  @IsOptional()
  detailsToDelete?: string[];

  @ApiProperty({
    type: [PurchaseOrderDetailDto],
    description:
      'Danh sách chi tiết đơn nhập hàng cần chỉnh sửa (chỉ áp dụng khi trạng thái là Pending)',
    required: false,
  })
  @IsArray({ message: 'Danh sách chi tiết cần chỉnh sửa phải là mảng' })
  @IsOptional()
  detailsToUpdate?: PurchaseOrderDetailDto[];
}
