import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CompaniesModule } from './companies/companies.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ContactsModule } from './contacts/contacts.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { DealsModule } from './deals/deals.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [CompaniesModule, PrismaModule, ContactsModule, TasksModule, DealsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
