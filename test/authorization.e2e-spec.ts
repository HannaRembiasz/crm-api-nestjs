import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { AuthGuard } from '../src/auth/auth.guard.js';
import cookieParser from 'cookie-parser';
import { DbExceptionFilter } from '../src/common/filters/db-exception.filter.js';
import { UserRole } from '../src/users/dto/create-user.dto.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let employeeAId: number;
  let employeeBId: number;
  let taskId: number;
  let listTaskAId: number;
  let listTaskBId: number;
  let companyId: number;
  let dealId: number;
  let testUser = {
    sub: 1,
    role: UserRole.ADMIN,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();

          request.user = testUser;

          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new DbExceptionFilter());
    await app.init();
  });

  beforeAll(async () => {
    const emailA = `employee-a-${Date.now()}@example.com`;
    const emailB = `employee-b-${Date.now()}@example.com`;

    const employeeA = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Employee A',
        email: emailA,
        password: 'Password123!',
      })
      .expect(201);

    const employeeB = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Employee B',
        email: emailB,
        password: 'Password123!',
      })
      .expect(201);

    employeeAId = employeeA.body.id;
    employeeBId = employeeB.body.id;

    testUser = {
      sub: 1,
      role: UserRole.ADMIN,
    };

    const task = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Authorization test task',
        assignedToId: employeeAId,
      })
      .expect(201);

    taskId = task.body.id;

    const company = await request(app.getHttpServer())
      .post('/companies')
      .send({
        name: `Authorization Test Company ${Date.now()}`,
      })
      .expect(201);

    companyId = company.body.id;

    const deal = await request(app.getHttpServer())
      .post('/deals')
      .send({
        title: `Authorization Test Deal ${Date.now()}`,
        status: 'LEAD',
        companyId,
        assignedToId: employeeAId,
      })
      .expect(201);

    dealId = deal.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  // Tests for role-based access control
  it('allows ADMIN to access an admin-only endpoint', async () => {
    testUser.role = UserRole.ADMIN;

    await request(app.getHttpServer()).delete('/users/999999').expect(404);
  });

  it('blocks MANAGER from an admin-only endpoint', async () => {
    testUser.role = UserRole.MANAGER;

    await request(app.getHttpServer()).delete('/users/999999').expect(403);
  });

  it('blocks EMPLOYEE from an admin-only endpoint', async () => {
    testUser.role = UserRole.EMPLOYEE;

    await request(app.getHttpServer()).delete('/users/999999').expect(403);
  });

  it('allows ADMIN on a manager/admin endpoint', async () => {
    testUser.role = UserRole.ADMIN;

    await request(app.getHttpServer()).post('/companies').send({}).expect(400);
  });

  it('allows MANAGER on a manager/admin endpoint', async () => {
    testUser.role = UserRole.MANAGER;

    await request(app.getHttpServer()).post('/companies').send({}).expect(400);
  });

  it('blocks EMPLOYEE from a manager/admin endpoint', async () => {
    testUser.role = UserRole.EMPLOYEE;

    await request(app.getHttpServer()).post('/companies').send({}).expect(403);
  });

  // Tests for task-based access control
  it('allows an employee to access their assigned task', async () => {
    testUser = {
      sub: employeeAId,
      role: UserRole.EMPLOYEE,
    };

    await request(app.getHttpServer()).get(`/tasks/${taskId}`).expect(200);
  });

  it("blocks an employee from another employee's task", async () => {
    testUser = {
      sub: employeeBId,
      role: UserRole.EMPLOYEE,
    };

    await request(app.getHttpServer()).get(`/tasks/${taskId}`).expect(403);
  });

  // Tests for task reassignment permissions
  it('blocks an employee from reassigning a task', async () => {
    testUser = {
      sub: employeeAId,
      role: UserRole.EMPLOYEE,
    };

    await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .send({
        assignedToId: employeeBId,
      })
      .expect(403);
  });

  it('allows a manager to reassign a task', async () => {
    testUser = {
      sub: 1,
      role: UserRole.MANAGER,
    };

    await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .send({
        assignedToId: employeeBId,
      })
      .expect(200);
  });

  // Tests for task reopening permissions
  it('blocks an employee from reopening a completed task', async () => {
    testUser = {
      sub: 1,
      role: UserRole.MANAGER,
    };

    await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .send({
        status: 'DONE',
      })
      .expect(200);

    testUser = {
      sub: employeeBId,
      role: UserRole.EMPLOYEE,
    };

    await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .send({
        status: 'IN_PROGRESS',
      })
      .expect(403);
  });

  // Tests for listing tasks based on employee permissions
  it('returns only permitted tasks for an employee', async () => {
    const titleSuffix = Date.now();

    testUser = {
      sub: 1,
      role: UserRole.ADMIN,
    };

    const taskA = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: `Authorization list test A ${titleSuffix}`,
        assignedToId: employeeAId,
      })
      .expect(201);

    const taskB = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: `Authorization list test B ${titleSuffix}`,
        assignedToId: employeeBId,
      })
      .expect(201);

    listTaskAId = taskA.body.id;
    listTaskBId = taskB.body.id;

    testUser = {
      sub: employeeBId,
      role: UserRole.EMPLOYEE,
    };

    const response = await request(app.getHttpServer())
      .get('/tasks')
      .query({ title: `Authorization list test`, limit: 10 })
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(listTaskBId);
    expect(response.body[0].assignedToId).toBe(employeeBId);
    expect(
      response.body.find((task: { id: number }) => task.id === listTaskAId),
    ).toBeUndefined();
  });

  // Tests for deal access based on employee permissions
  it('allows an employee to access their assigned deal', async () => {
    testUser = {
      sub: employeeAId,
      role: UserRole.EMPLOYEE,
    };

    await request(app.getHttpServer()).get(`/deals/${dealId}`).expect(200);
  });

  it("blocks an employee from another employee's deal", async () => {
    testUser = {
      sub: employeeBId,
      role: UserRole.EMPLOYEE,
    };

    await request(app.getHttpServer()).get(`/deals/${dealId}`).expect(403);
  });

  // Tests for deal reassignment permissions based on employee and manager roles
  it('blocks an employee from reassigning a deal', async () => {
    testUser = {
      sub: employeeAId,
      role: UserRole.EMPLOYEE,
    };

    await request(app.getHttpServer())
      .patch(`/deals/${dealId}`)
      .send({
        assignedToId: employeeBId,
      })
      .expect(403);
  });

  it('allows a manager to reassign a deal', async () => {
    testUser = {
      sub: 1,
      role: UserRole.MANAGER,
    };

    await request(app.getHttpServer())
      .patch(`/deals/${dealId}`)
      .send({
        assignedToId: employeeBId,
      })
      .expect(200);
  });

  // Tests for reopening a won deal based on employee and manager roles
  it('blocks an employee from reopening a won deal', async () => {
    testUser = {
      sub: 1,
      role: UserRole.MANAGER,
    };

    await request(app.getHttpServer())
      .patch(`/deals/${dealId}`)
      .send({
        status: 'WON',
      })
      .expect(200);

    testUser = {
      sub: employeeBId,
      role: UserRole.EMPLOYEE,
    };

    await request(app.getHttpServer())
      .patch(`/deals/${dealId}`)
      .send({
        status: 'LEAD',
      })
      .expect(403);
  });

  // Tests for listing deals based on employee permissions
  it('returns only permitted deals for an employee', async () => {
    const titleSuffix = Date.now();

    testUser = {
      sub: 1,
      role: UserRole.ADMIN,
    };

    const dealA = await request(app.getHttpServer())
      .post('/deals')
      .send({
        title: `Authorization list deal A ${titleSuffix}`,
        status: 'LEAD',
        companyId,
        assignedToId: employeeAId,
      })
      .expect(201);

    const dealB = await request(app.getHttpServer())
      .post('/deals')
      .send({
        title: `Authorization list deal B ${titleSuffix}`,
        status: 'LEAD',
        companyId,
        assignedToId: employeeBId,
      })
      .expect(201);

    testUser = {
      sub: employeeBId,
      role: UserRole.EMPLOYEE,
    };

    const response = await request(app.getHttpServer())
      .get('/deals')
      .query({ title: 'Authorization list deal', limit: 10 })
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(dealB.body.id);
    expect(response.body[0].assignedToId).toBe(employeeBId);
    expect(
      response.body.find((deal: { id: number }) => deal.id === dealA.body.id),
    ).toBeUndefined();
  });
});
