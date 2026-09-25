import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtService } from '@nestjs/jwt';

import { AppModule } from '../src/app.module.js';
import { DbExceptionFilter } from '../src/common/filters/db-exception.filter.js';

describe('Resources (e2e)', () => {
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

  it('creates related resources and returns them in company overview', async () => {
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
        name: 'Resources Test Employee',
        email: `resources-${Date.now()}@example.com`,
        password: 'Password123!',
      })
      .expect(201);

    const employeeId = employeeResponse.body.id;

    const companyResponse = await request(app.getHttpServer())
      .post('/companies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Resources Test Company ${Date.now()}`,
      })
      .expect(201);

    const companyId = companyResponse.body.id;

    const contactResponse = await request(app.getHttpServer())
      .post('/contacts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'John',
        lastName: 'Smith',
        email: `resources-contact-${Date.now()}@example.com`,
        companyId,
      })
      .expect(201);

    const taskResponse = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Resources Test Task ${Date.now()}`,
        companyId,
        assignedToId: employeeId,
      })
      .expect(201);

    const dealResponse = await request(app.getHttpServer())
      .post('/deals')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Resources Test Deal ${Date.now()}`,
        status: 'LEAD',
        companyId,
        assignedToId: employeeId,
      })
      .expect(201);

    const overviewResponse = await request(app.getHttpServer())
      .get(`/companies/${companyId}/overview`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(overviewResponse.body.company.id).toBe(companyId);

    expect(
      overviewResponse.body.contacts.some(
        (contact: { id: number }) => contact.id === contactResponse.body.id,
      ),
    ).toBe(true);

    expect(
      overviewResponse.body.tasks.some(
        (task: { id: number }) => task.id === taskResponse.body.id,
      ),
    ).toBe(true);

    expect(
      overviewResponse.body.deals.some(
        (deal: { id: number }) => deal.id === dealResponse.body.id,
      ),
    ).toBe(true);
  });
});
