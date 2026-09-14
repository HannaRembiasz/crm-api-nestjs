import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller.js';
import { CompaniesService } from './companies.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [CompaniesController],
  providers: [CompaniesService]
})
export class CompaniesModule {}
