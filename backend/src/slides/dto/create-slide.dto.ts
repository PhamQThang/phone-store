// backend/src/slides/dto/create-slide.dto.ts
import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class CreateSlideDto {
  @ApiProperty({
    description: 'Tiêu đề của slide',
    example: 'Khuyến mãi mùa hè',
    required: false,
  })
  @IsString({ message: 'Tiêu đề phải là chuỗi' })
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Link của slide',
    example: 'https://example.com',
    required: false,
  })
  @IsString({ message: 'Link phải là chuỗi' })
  @IsOptional()
  link?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động của slide',
    example: true,
    required: false,
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Thứ tự hiển thị của slide',
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsInt({ message: 'Thứ tự hiển thị phải là số nguyên' })
  @IsOptional()
  displayOrder?: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File ảnh của slide',
  })
  @Type(() => Object)
  file?: Express.Multer.File;
}
