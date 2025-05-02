// warranty-request.dto.ts
import { IsNotEmpty, IsString, IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWarrantyRequestDto {
  @ApiProperty({
    description: 'ID của ProductIdentity (IMEI của sản phẩm)',
    example: 'product-identity-123',
  })
  @IsString({ message: 'ID ProductIdentity phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'ID ProductIdentity không được để trống' })
  productIdentityId: string;

  @ApiProperty({
    description: 'Lý do yêu cầu bảo hành',
    example: 'Sản phẩm bị lỗi màn hình',
  })
  @IsString({ message: 'Lý do phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Lý do không được để trống' })
  reason: string;

  @ApiProperty({
    description: 'Họ và tên của người yêu cầu',
    example: 'Nguyễn Văn A',
  })
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @ApiProperty({
    description: 'Số điện thoại của người yêu cầu',
    example: '0123456789',
  })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^[0-9]{10,15}$/, {
    message: 'Số điện thoại phải có từ 10 đến 15 chữ số',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Email của người yêu cầu',
    example: 'nguyenvana@example.com',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;
}

export class UpdateWarrantyRequestStatusDto {
  @ApiProperty({
    description: 'Trạng thái mới của yêu cầu bảo hành',
    example: 'Approved',
    enum: ['Pending', 'Approved', 'Rejected'],
  })
  @IsString({ message: 'Trạng thái phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  status: string;
}
