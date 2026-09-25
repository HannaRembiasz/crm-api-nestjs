import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CompaniesModule } from './companies/companies.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ContactsModule } from './contacts/contacts.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { DealsModule } from './deals/deals.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { StatsModule } from './stats/stats.module.js';
import { ThrottlerModule } from '@nestjs/throttler';
import { InternalModule } from './internal/internal.module.js';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60_000,
          limit: 10,
        },
      ],
    }),
    CompaniesModule,
    PrismaModule,
    ContactsModule,
    TasksModule,
    DealsModule,
    UsersModule,
    AuthModule,
    StatsModule,
    InternalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
