import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module'; // Thêm ProductsModule

@Module({
  imports: [PrismaModule, ProductsModule], // Import ProductsModule
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
