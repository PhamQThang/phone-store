import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddProductToPromotionDto {
  @ApiProperty({ description: 'ID của sản phẩm', example: 'uuid-of-product' })
  @IsString({ message: 'ID sản phẩm phải là chuỗi' })
  @IsNotEmpty({ message: 'ID sản phẩm không được để trống' })
  productId: string;
}
