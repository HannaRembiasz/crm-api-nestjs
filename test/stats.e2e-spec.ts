import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtService } from '@nestjs/jwt';

import { AppModule } from '../src/app.module.js';
import { DbExceptionFilter } from '../src/common/filters/db-exception.filter.js';
import { UserRole } from '../src/users/dto/create-user.dto.js';

describe('Stats (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new DbExceptionFilter());

    jwtService = app.get<JwtService>(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns deal statistics filtered by date', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const futureDate = '2099-01-01';

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@mail.com',
        password: 'admin.password',
      })
      .expect(201);

    const adminToken = adminLogin.body.access_token;

    const employeeResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Stats Deal Employee',
        email: `stats-deal-${Date.now()}@example.com`,
        password: 'Password123!',
      })
      .expect(201);

    const companyResponse = await request(app.getHttpServer())
      .post('/companies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Stats Deal Company ${Date.now()}`,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/deals')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Stats Test Deal ${Date.now()}`,
        status: 'LEAD',
        companyId: companyResponse.body.id,
        assignedToId: employeeResponse.body.id,
      })
      .expect(201);

    const filteredResponse = await request(app.getHttpServer())
      .get('/stats/deals')
      .query({
        from: today,
        to: today,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(filteredResponse.body.totalDeals).toBeGreaterThan(0);

    const futureResponse = await request(app.getHttpServer())
      .get('/stats/deals')
      .query({
        from: futureDate,
        to: futureDate,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(futureResponse.body.totalDeals).toBe(0);
  });

  it('returns overview statistics filtered by date', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const futureDate = '2099-01-01';

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@mail.com',
        password: 'admin.password',
      })
      .expect(201);

    const adminToken = adminLogin.body.access_token;

    const employeeResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Stats Overview Employee',
        email: `stats-overview-${Date.now()}@example.com`,
        password: 'Password123!',
      })
      .expect(201);

    const companyResponse = await request(app.getHttpServer())
      .post('/companies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Stats Overview Company ${Date.now()}`,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/contacts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Stats',
        lastName: 'Contact',
        email: `stats-contact-${Date.now()}@example.com`,
        companyId: companyResponse.body.id,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Stats Overview Task ${Date.now()}`,
        companyId: companyResponse.body.id,
        assignedToId: employeeResponse.body.id,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/deals')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Stats Overview Deal ${Date.now()}`,
        status: 'LEAD',
        companyId: companyResponse.body.id,
        assignedToId: employeeResponse.body.id,
      })
      .expect(201);

    const filteredResponse = await request(app.getHttpServer())
      .get('/stats/overview')
      .query({
        from: today,
        to: today,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(filteredResponse.body.companies).toBeGreaterThan(0);
    expect(filteredResponse.body.contacts).toBeGreaterThan(0);
    expect(filteredResponse.body.tasks.total).toBeGreaterThan(0);
    expect(filteredResponse.body.tasks.todo).toBeGreaterThan(0);
    expect(filteredResponse.body.deals.total).toBeGreaterThan(0);
    expect(filteredResponse.body.deals.open).toBeGreaterThan(0);

    const futureResponse = await request(app.getHttpServer())
      .get('/stats/overview')
      .query({
        from: futureDate,
        to: futureDate,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(futureResponse.body.companies).toBe(0);
    expect(futureResponse.body.contacts).toBe(0);
    expect(futureResponse.body.tasks.total).toBe(0);
    expect(futureResponse.body.deals.total).toBe(0);
  });
});
