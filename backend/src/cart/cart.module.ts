// src/cart/cart.module.ts
import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module'; // Import ProductsModule

@Module({
  imports: [PrismaModule, ProductsModule], // Thêm ProductsModule
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
