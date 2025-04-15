import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  Min,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePromotionDto {
  @ApiProperty({ description: 'Mã khuyến mãi', example: 'PROMO2025' })
  @IsString({ message: 'Mã khuyến mãi phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã khuyến mãi không được để trống' })
  code: string;

  @ApiProperty({
    description: 'Mô tả khuyến mãi',
    example: 'Giảm giá mùa hè',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @ApiProperty({
    description: 'Số tiền giảm giá (số tiền cố định)',
    example: 10,
  })
  @IsInt({ message: 'Số tiền giảm giá phải là số nguyên' })
  @Min(0, { message: 'Số tiền giảm giá không được âm' })
  @IsNotEmpty({ message: 'Số tiền giảm giá không được để trống' })
  discount: number;

  @ApiProperty({
    description: 'Ngày bắt đầu khuyến mãi',
    example: '2025-04-15T00:00:00Z',
  })
  @IsDateString({}, { message: 'Ngày bắt đầu phải là định dạng ISO 8601' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  startDate: string;

  @ApiProperty({
    description: 'Ngày kết thúc khuyến mãi',
    example: '2025-04-30T23:59:59Z',
  })
  @IsDateString({}, { message: 'Ngày kết thúc phải là định dạng ISO 8601' })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  endDate: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động của khuyến mãi',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là giá trị boolean' })
  isActive?: boolean;
}
