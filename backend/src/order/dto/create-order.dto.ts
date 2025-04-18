import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Địa chỉ giao hàng',
    example: '123 Đường ABC, Quận 1, TP.HCM',
  })
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address: string;

  @ApiProperty({
    description: 'Phương thức thanh toán',
    example: 'COD',
    enum: ['COD', 'Online'],
  })
  @IsEnum(['COD', 'Online'], {
    message: 'Phương thức thanh toán phải là COD hoặc Online',
  })
  @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống' })
  paymentMethod: string;

  @ApiProperty({
    description: 'Ghi chú đơn hàng (không bắt buộc)',
    example: 'Giao hàng trước 5 giờ chiều',
    required: false,
  })
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  @IsOptional()
  note?: string;

  @ApiProperty({
    description: 'ID của giỏ hàng',
    example: 'cart-123',
  })
  @IsString({ message: 'ID giỏ hàng phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'ID giỏ hàng không được để trống' })
  cartId: string;

  @ApiProperty({
    description: 'Số điện thoại giao hàng (không bắt buộc)',
    example: '0123456789',
    required: false,
  })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description:
      'Danh sách ID của các sản phẩm được chọn trong giỏ hàng để đặt hàng',
    example: ['cartItem-1', 'cartItem-2'],
  })
  @IsArray({ message: 'Danh sách ID sản phẩm phải là một mảng' })
  @IsString({ each: true, message: 'Mỗi ID sản phẩm phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Danh sách ID sản phẩm không được để trống' })
  cartItemIds: string[];
}
