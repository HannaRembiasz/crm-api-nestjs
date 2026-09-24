import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { DbExceptionFilter } from '../src/common/filters/db-exception.filter.js';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../src/users/dto/create-user.dto.js';

describe('Authentication (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());

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

  afterEach(async () => {
    await app.close();
  });

  // Test for successful user registration
  it('registers a user successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'Password123!',
      })
      .expect(201);

    expect(response.body).toBeDefined();
  });

  // Test for invalid registration data
  it('rejects invalid registration data', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: '',
        email: 'not-an-email',
        password: '',
      })
      .expect(400);
  });

  // Test for duplicate email registration
  it('rejects duplicate email', async () => {
    const email = `duplicate-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'First User',
        email,
        password: 'Password123!',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Second User',
        email,
        password: 'Password123!',
      })
      .expect(409);
  });

  // Test for successful login
  it('logs in successfully', async () => {
    const email = `login-${Date.now()}@example.com`;
    const password = 'Password123!';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Login Test User',
        email,
        password,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(201);

    expect(response.body).toBeDefined();
  });

  // Test for login with wrong password
  it('rejects wrong password', async () => {
    const email = `wrong-password-${Date.now()}@example.com`;
    const password = 'Password123!';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Wrong Password User',
        email,
        password,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'WrongPassword123!',
      })
      .expect(401);
  });

  // Test for login with nonexistent user
  it('rejects nonexistent user', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `nonexistent-${Date.now()}@example.com`,
        password: 'Password123!',
      })
      .expect(401);
  });

  // Test for access to a protected endpoint without a token
  it('rejects access to a protected endpoint without a token', async () => {
    await request(app.getHttpServer()).get('/companies').expect(401);
  });

  // Test for access to a protected endpoint with an invalid token
  it('rejects an invalid access token', async () => {
    await request(app.getHttpServer())
      .get('/companies')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  // Test for access to a protected endpoint with an expired token
  it('rejects an expired access token', async () => {
    const token = await jwtService.signAsync(
      {
        sub: 1,
        role: UserRole.ADMIN,
      },
      {
        expiresIn: -10,
      },
    );

    await request(app.getHttpServer())
      .get('/companies')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  // Test for refreshing the access token successfully
  it('refreshes the access token successfully', async () => {
  const agent = request.agent(app.getHttpServer());

  const email = `refresh-${Date.now()}@example.com`;
  const password = 'Password123!';

  await agent
    .post('/auth/register')
    .send({
      name: 'Refresh Test User',
      email,
      password,
    })
    .expect(201);

  const loginResponse = await agent
    .post('/auth/login')
    .send({
      email,
      password,
    })
    .expect(201);

  expect(loginResponse.body.access_token).toBeDefined();

  const refreshResponse = await agent
    .post('/auth/refresh')
    .expect(201);

  expect(refreshResponse.body.access_token).toBeDefined();
});

  // Test for rejecting refresh after logout
it('rejects refresh after logout', async () => {
  const agent = request.agent(app.getHttpServer());

  const email = `logout-${Date.now()}@example.com`;
  const password = 'Password123!';

  await agent
    .post('/auth/register')
    .send({
      name: 'Logout Test User',
      email,
      password,
    })
    .expect(201);

  const loginResponse = await agent
    .post('/auth/login')
    .send({
      email,
      password,
    })
    .expect(201);

  const accessToken = loginResponse.body.access_token;

  await agent
    .post('/auth/logout')
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(201);

  await agent
    .post('/auth/refresh')
    .expect(401);
});

// Test for rejecting an access token after logout
it('rejects access with an access token after logout', async () => {
  const agent = request.agent(app.getHttpServer());

  const email = `logout-access-${Date.now()}@example.com`;
  const password = 'Password123!';

  await agent
    .post('/auth/register')
    .send({
      name: 'Logout Access Test User',
      email,
      password,
    })
    .expect(201);

  const loginResponse = await agent
    .post('/auth/login')
    .send({
      email,
      password,
    })
    .expect(201);

  const accessToken = loginResponse.body.access_token;

  await agent
    .get('/auth/me')
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(200);

  await agent
    .post('/auth/logout')
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(201);

  await agent
    .get('/auth/me')
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(401);
});
});
