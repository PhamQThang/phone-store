// backend/src/colors/dto/create-color.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateColorDto {
  @ApiProperty({ description: 'Tên của màu', example: 'Đỏ' })
  @IsString({ message: 'Tên màu phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên màu không được để trống' })
  name: string;
}
