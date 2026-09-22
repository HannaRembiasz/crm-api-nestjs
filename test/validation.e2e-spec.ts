import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import type { ExecutionContext } from '@nestjs/common';
import { UserRole } from '../src/users/dto/create-user.dto.js';
import { AuthGuard } from '../src/auth/auth.guard.js';
import { DbExceptionFilter } from './../src/common/filters/db-exception.filter.js';

describe('Validation (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();

          request.user = {
            sub: 1,
            role: UserRole.ADMIN,
          };

          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new DbExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Validation tests for numeric IDs
  it('rejects a non-numeric company id', async () => {
    await request(app.getHttpServer()).get('/companies/abc').expect(400);
  });

  it('rejects a non-numeric contact id', async () => {
    await request(app.getHttpServer()).get('/contacts/abc').expect(400);
  });

  it('rejects a non-numeric task id', async () => {
    await request(app.getHttpServer()).get('/tasks/abc').expect(400);
  });

  it('rejects a non-numeric deal id', async () => {
    await request(app.getHttpServer()).get('/deals/abc').expect(400);
  });

  it('rejects a non-numeric user id', async () => {
    await request(app.getHttpServer()).get('/users/abc').expect(400);
  });

  // Validation tests for request bodies
  it('rejects invalid company data', async () => {
    await request(app.getHttpServer()).post('/companies').send({}).expect(400);
  });

  it('rejects invalid contact data', async () => {
    await request(app.getHttpServer()).post('/contacts').send({}).expect(400);
  });

  it('rejects invalid task data', async () => {
    await request(app.getHttpServer()).post('/tasks').send({}).expect(400);
  });

  it('rejects invalid deal data', async () => {
    await request(app.getHttpServer()).post('/deals').send({}).expect(400);
  });

  it('rejects invalid user data', async () => {
    await request(app.getHttpServer()).post('/users').send({}).expect(400);
  });

  // Validation tests for updating statuses
  it('rejects an invalid task status on update', async () => {
    await request(app.getHttpServer())
      .patch('/tasks/1')
      .send({ status: 'INVALID' })
      .expect(400);
  });

  it('rejects an invalid deal status on update', async () => {
    await request(app.getHttpServer())
      .patch('/deals/1')
      .send({ status: 'INVALID' })
      .expect(400);
  });

  // Validation tests for updating emails
  it('rejects an invalid user email on update', async () => {
    await request(app.getHttpServer())
      .patch('/users/1')
      .send({ email: 'not-an-email' })
      .expect(400);
  });

  it('rejects an invalid contact email on update', async () => {
    await request(app.getHttpServer())
      .patch('/contacts/1')
      .send({ email: 'not-an-email' })
      .expect(400);
  });

  // Validation tests for enum query parameters
  it('rejects an invalid task status', async () => {
    await request(app.getHttpServer()).get('/tasks?status=INVALID').expect(400);
  });

  it('rejects an invalid deal status', async () => {
    await request(app.getHttpServer()).get('/deals?status=INVALID').expect(400);
  });

  it('rejects an invalid user role', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'INVALID',
      })
      .expect(400);
  });

  // Validation tests for pagination and sorting query parameters
  it('rejects a non-numeric page', async () => {
    await request(app.getHttpServer()).get('/companies?page=abc').expect(400);
  });

  it('rejects a limit below the minimum', async () => {
    await request(app.getHttpServer()).get('/companies?limit=0').expect(400);
  });

  it('rejects a limit above the maximum', async () => {
    await request(app.getHttpServer()).get('/companies?limit=101').expect(400);
  });

  it('rejects an invalid sort order', async () => {
    await request(app.getHttpServer())
      .get('/companies?sortOrder=INVALID')
      .expect(400);
  });

  // Validation tests for date
  it('rejects an invalid stats from date', async () => {
    await request(app.getHttpServer())
      .get('/stats/deals?from=not-a-date')
      .expect(400);
  });

  it('rejects an invalid stats to date', async () => {
    await request(app.getHttpServer())
      .get('/stats/deals?to=not-a-date')
      .expect(400);
  });

  it('rejects stats when from is after to', async () => {
    await request(app.getHttpServer())
      .get('/stats/deals?from=2026-10-01&to=2026-09-01')
      .expect(400);
  });

  it('rejects tasks when dueAfter is after dueBefore', async () => {
    await request(app.getHttpServer())
      .get('/tasks?dueAfter=2026-09-30&dueBefore=2026-09-01')
      .expect(400);
  });

  // Validation tests for numeric query parameters in tasks
  it('rejects a non-numeric companyId in task query', async () => {
    await request(app.getHttpServer()).get('/tasks?companyId=abc').expect(400);
  });

  it('rejects a non-numeric assignedToId in task query', async () => {
    await request(app.getHttpServer())
      .get('/tasks?assignedToId=abc')
      .expect(400);
  });

  // Validation tests for nonexistent entities
  it('rejects a task with a nonexistent company', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Test task',
        companyId: 999999,
        assignedToId: 1,
      })
      .expect(404);
  });

  it('rejects a deal with a nonexistent assigned user', async () => {
    await request(app.getHttpServer())
      .post('/deals')
      .send({
        title: 'Test deal',
        status: 'LEAD',
        companyId: 1,
        assignedToId: 999999,
      })
      .expect(404);
  });
});
