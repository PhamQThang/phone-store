// backend/src/models/models.module.ts
import { Module } from '@nestjs/common';
import { ModelsService } from './models.service';
import { ModelsController } from './models.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ModelsController],
  providers: [ModelsService],
})
export class ModelsModule {}
