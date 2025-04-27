// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BrandsModule } from './brands/brands.module';
import { ModelsModule } from './models/models.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ProductsModule } from './products/products.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { ColorsModule } from './colors/colors.module';
import { CartModule } from './cart/cart.module';
import { UsersModule } from './users/users.module';
import { SlidesModule } from './slides/slides.module';
import { PromotionsModule } from './promotions/promotions.module';
import { OrderModule } from './order/order.module';
import { StatisticsModule } from './statistics/statistics.module';
import { WarrantyModule } from './warranty/warranty.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    BrandsModule,
    ModelsModule,
    SuppliersModule,
    ProductsModule,
    CloudinaryModule,
    PurchaseOrdersModule,
    ColorsModule,
    CartModule,
    UsersModule,
    SlidesModule,
    PromotionsModule,
    OrderModule,
    StatisticsModule,
    WarrantyModule,
  ],
})
export class AppModule {}
