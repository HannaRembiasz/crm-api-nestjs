import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DbExceptionFilter } from './common/filters/db-exception.filter.js';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new DbExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('CRM API')
    .setDescription(
      `
A production-ready REST API for a CRM application built with NestJS, PostgreSQL, Prisma, and JWT authentication.

The API provides company, contact, task, deal, and user management, with role-based and resource-level authorization. It also includes validation, rate limiting, protected authentication flows, and automated demo data maintenance.

Demo accounts are provided for Employee, Manager, and Admin roles so you can explore different authorization levels.
`,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'Registration, login, token refresh and logout')
    .addTag('Companies', 'Company management and related resources')
    .addTag('Contacts', 'Contact management')
    .addTag('Tasks', 'Task management and assignment')
    .addTag('Deals', 'Deal management and sales pipeline')
    .addTag('Users', 'User management')
    .addTag('Statistics', 'CRM statistics and reporting')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
