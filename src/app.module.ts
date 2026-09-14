import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CompaniesModule } from './companies/companies.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [CompaniesModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
