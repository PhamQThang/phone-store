import { Module } from '@nestjs/common';
import { ProductIdentitiesService } from './product-identities.service';
import { ProductIdentitiesController } from './product-identities.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductIdentitiesController],
  providers: [ProductIdentitiesService],
})
export class ProductIdentitiesModule {}
