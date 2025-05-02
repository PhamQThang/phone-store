import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { return_status, returnticket_status } from '@prisma/client';

export class CreateReturnDto {
  @ApiProperty({
    description: 'ID của ProductIdentity (IMEI của sản phẩm)',
    example: 'product-identity-123',
  })
  @IsString({ message: 'ID ProductIdentity phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'ID ProductIdentity không được để trống' })
  productIdentityId: string;

  @ApiProperty({
    description: 'Lý do yêu cầu đổi trả',
    example: 'Sản phẩm bị lỗi màn hình',
  })
  @IsString({ message: 'Lý do phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Lý do không được để trống' })
  reason: string;

  @ApiProperty({
    description: 'Họ tên người yêu cầu đổi trả',
    example: 'Nguyễn Văn A',
  })
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

  @ApiProperty({
    description: 'Số điện thoại người yêu cầu đổi trả',
    example: '0909123456',
  })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phoneNumber: string;

  @ApiProperty({
    description: 'Địa chỉ người yêu cầu đổi trả',
    example: '123 Đường Láng, Đống Đa, Hà Nội',
  })
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address: string;
}

export class UpdateReturnStatusDto {
  @ApiProperty({
    description: 'Trạng thái mới của yêu cầu đổi trả',
    example: 'Approved',
    enum: return_status,
  })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  status: return_status;
}

export class UpdateReturnTicketStatusDto {
  @ApiProperty({
    description: 'Trạng thái mới của phiếu đổi trả',
    example: 'Processing',
    enum: returnticket_status,
  })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  status: returnticket_status;
}
