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
    .setDescription('REST API for a CRM application')
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
