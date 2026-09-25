import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { InternalController } from './internal.controller.js';
import { InternalMaintainService } from './internal.service.js';
import { InternalMaintainGuard } from './internal.guard.js';

@Module({
  imports: [PrismaModule],
  controllers: [InternalController],
  providers: [InternalMaintainService, InternalMaintainGuard],
})
export class InternalModule {}