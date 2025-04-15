import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePromotionDto {
  @ApiProperty({
    description: 'Mã khuyến mãi',
    example: 'PROMO2025',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mã khuyến mãi phải là chuỗi' })
  code?: string;

  @ApiProperty({
    description: 'Mô tả khuyến mãi',
    example: 'Giảm giá mùa đông',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @ApiProperty({
    description: 'Số tiền giảm giá (số tiền cố định)',
    example: 15,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Số tiền giảm giá phải là số nguyên' })
  @Min(0, { message: 'Số tiền giảm giá không được âm' })
  discount?: number;

  @ApiProperty({
    description: 'Ngày bắt đầu khuyến mãi',
    example: '2025-04-15T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày bắt đầu phải là định dạng ISO 8601' })
  startDate?: string;

  @ApiProperty({
    description: 'Ngày kết thúc khuyến mãi',
    example: '2025-04-30T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày kết thúc phải là định dạng ISO 8601' })
  endDate?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động của khuyến mãi',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là giá trị boolean' })
  isActive?: boolean;
}
