import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module.js';
import { DbExceptionFilter } from '../src/common/filters/db-exception.filter.js';

describe('Rate limiting (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
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

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should rate-limit login after 5 requests', async () => {
    const email = `rate-login-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Rate Limit Login',
        email,
        password: 'Password123!',
      })
      .expect(201);

    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password: 'Password123!',
        })
        .expect(201);
    }

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'Password123!',
      })
      .expect(429);
  });

  it('should rate-limit registration after 5 requests', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: `Rate Limit Register ${i}`,
          email: `rate-register-${Date.now()}-${i}@example.com`,
          password: 'Password123!',
        })
        .expect(201);
    }

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Rate Limit Register Blocked',
        email: `rate-register-blocked-${Date.now()}@example.com`,
        password: 'Password123!',
      })
      .expect(429);
  });

  it('should rate-limit refresh after 10 requests', async () => {
    const email = `rate-refresh-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Rate Limit Refresh',
        email,
        password: 'Password123!',
      })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'Password123!',
      })
      .expect(201);

    const refreshCookie = loginResponse.headers['set-cookie'][0]
      .split(';')[0];

    for (let i = 0; i < 10; i++) {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', refreshCookie);
    }

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', refreshCookie)
      .expect(429);
  });
});