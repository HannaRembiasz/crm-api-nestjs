import { Module } from '@nestjs/common';
import { DealsController } from './deals.controller.js';
import { DealsService } from './deals.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [DealsController],
  providers: [DealsService]
})
export class DealsModule {}
