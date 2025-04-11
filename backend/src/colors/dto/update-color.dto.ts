// backend/src/colors/dto/update-color.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateColorDto {
  @ApiProperty({
    description: 'Tên của màu',
    example: 'Đỏ',
    required: false,
  })
  @IsString({ message: 'Tên màu phải là chuỗi' })
  @IsOptional()
  name?: string;
}
