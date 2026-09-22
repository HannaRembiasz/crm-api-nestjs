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
    const now = new Date();

    const today = now.toISOString().slice(0, 10);

    const adminToken = await jwtService.signAsync({
      sub: 1,
      sid: 1,
      email: 'stats-admin@example.com',
      role: UserRole.ADMIN,
    });

    const baselineResponse = await request(app.getHttpServer())
      .get('/stats/deals')
      .query({
        from: today,
        to: today,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/companies')
      .send({
        name: `Stats Test Company ${Date.now()}`,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    const companyResponse = await request(app.getHttpServer())
      .post('/companies')
      .send({
        name: `Stats Deal Company ${Date.now()}`,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    const employeeResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Stats Test Employee',
        email: `stats-${Date.now()}@example.com`,
        password: 'Password123!',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/deals')
      .send({
        title: `Stats Test Deal ${Date.now()}`,
        status: 'LEAD',
        companyId: companyResponse.body.id,
        assignedToId: employeeResponse.body.id,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    const filteredResponse = await request(app.getHttpServer())
      .get('/stats/deals')
      .query({
        from: today,
        to: today,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(filteredResponse.body.totalDeals).toBe(
      baselineResponse.body.totalDeals + 1,
    );
  });

  it('returns overview statistics filtered by date', async () => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    const adminToken = await jwtService.signAsync({
      sub: 1,
      sid: 1,
      email: 'stats-admin@example.com',
      role: UserRole.ADMIN,
    });

    const baselineResponse = await request(app.getHttpServer())
      .get('/stats/overview')
      .query({
        from: today,
        to: today,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

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
      .send({
        name: `Stats Overview Company ${Date.now()}`,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post('/contacts')
      .send({
        firstName: 'Stats',
        lastName: 'Contact',
        email: `stats-contact-${Date.now()}@example.com`,
        companyId: companyResponse.body.id,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: `Stats Overview Task ${Date.now()}`,
        companyId: companyResponse.body.id,
        assignedToId: employeeResponse.body.id,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post('/deals')
      .send({
        title: `Stats Overview Deal ${Date.now()}`,
        status: 'LEAD',
        companyId: companyResponse.body.id,
        assignedToId: employeeResponse.body.id,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    const filteredResponse = await request(app.getHttpServer())
      .get('/stats/overview')
      .query({
        from: today,
        to: today,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(filteredResponse.body.companies).toBe(
      baselineResponse.body.companies + 1,
    );

    expect(filteredResponse.body.contacts).toBe(
      baselineResponse.body.contacts + 1,
    );

    expect(filteredResponse.body.tasks.total).toBe(
      baselineResponse.body.tasks.total + 1,
    );

    expect(filteredResponse.body.tasks.todo).toBe(
      baselineResponse.body.tasks.todo + 1,
    );

    expect(filteredResponse.body.deals.total).toBe(
      baselineResponse.body.deals.total + 1,
    );

    expect(filteredResponse.body.deals.open).toBe(
      baselineResponse.body.deals.open + 1,
    );
  });
});
