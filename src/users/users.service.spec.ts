import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { vi } from 'vitest';

import { UsersService } from './users.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from './dto/create-user.dto.js';

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock = {
    client: {
      orm: {
        public: {
          User: {
            where: vi.fn(),
            select: vi.fn(),
            first: vi.fn(),
            all: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
          },
          Deal: {
            where: vi.fn(),
            all: vi.fn(),
          },
          Task: {
            where: vi.fn(),
            all: vi.fn(),
          },
        },
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    vi.clearAllMocks();

    const userQuery = prismaMock.client.orm.public.User;
    const dealQuery = prismaMock.client.orm.public.Deal;
    const taskQuery = prismaMock.client.orm.public.Task;

    userQuery.where.mockReturnValue(userQuery);
    userQuery.select.mockReturnValue(userQuery);

    dealQuery.where.mockReturnValue(dealQuery);
    taskQuery.where.mockReturnValue(taskQuery);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // getAllUsers

  it('should apply user query filters', async () => {
    prismaMock.client.orm.public.User.all.mockResolvedValue([]);

    await service.getAllUsers({
      name: 'John',
      email: 'john@example.com',
      role: UserRole.MANAGER,
    });

    const whereMock = prismaMock.client.orm.public.User.where;

    expect(whereMock).toHaveBeenCalledTimes(3);

    expect(whereMock).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
    );

    expect(whereMock).toHaveBeenNthCalledWith(
      2,
      expect.any(Function),
    );

    expect(whereMock).toHaveBeenNthCalledWith(3, {
      role: UserRole.MANAGER,
    });

    expect(
      prismaMock.client.orm.public.User.select,
    ).toHaveBeenCalledWith(
      'id',
      'email',
      'name',
      'role',
      'createdAt',
      'updatedAt',
    );

    expect(
      prismaMock.client.orm.public.User.all,
    ).toHaveBeenCalledTimes(1);
  });

  // getUserById

  it('should return a user by id without password', async () => {
    const user = {
      id: 1,
      email: 'john@example.com',
      name: 'John',
      role: UserRole.EMPLOYEE,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    prismaMock.client.orm.public.User.first.mockResolvedValue(user);

    const result = await service.getUserById(1);

    expect(result).toEqual(user);

    expect(
      prismaMock.client.orm.public.User.where,
    ).toHaveBeenCalledWith({ id: 1 });

    expect(
      prismaMock.client.orm.public.User.select,
    ).toHaveBeenCalledWith(
      'id',
      'email',
      'name',
      'role',
      'createdAt',
      'updatedAt',
    );
  });

  it('should throw NotFoundException when user does not exist', async () => {
    prismaMock.client.orm.public.User.first.mockResolvedValue(
      undefined,
    );

    await expect(
      service.getUserById(999),
    ).rejects.toThrow(NotFoundException);
  });

  // getUserDeals

  it('should return a user deals for an employee accessing their own deals', async () => {
    const deals = [
      {
        id: 1,
        assignedToId: 20,
      },
    ];

    prismaMock.client.orm.public.User.first.mockResolvedValue({
      id: 20,
    });

    prismaMock.client.orm.public.Deal.all.mockResolvedValue(deals);

    const result = await service.getUserDeals(
      20,
      20,
      UserRole.EMPLOYEE,
    );

    expect(result).toEqual(deals);

    expect(
      prismaMock.client.orm.public.Deal.where,
    ).toHaveBeenCalledWith({
      assignedToId: 20,
    });
  });

  it("should reject an employee accessing another user's deals", async () => {
    prismaMock.client.orm.public.User.first.mockResolvedValue({
      id: 10,
    });

    await expect(
      service.getUserDeals(
        10,
        20,
        UserRole.EMPLOYEE,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(
      prismaMock.client.orm.public.Deal.all,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when target user does not exist', async () => {
    prismaMock.client.orm.public.User.first.mockResolvedValue(
      undefined,
    );

    await expect(
      service.getUserDeals(
        999,
        20,
        UserRole.EMPLOYEE,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  // getUserTasks

  it('should return a user tasks for an employee accessing their own tasks', async () => {
    const tasks = [
      {
        id: 1,
        assignedToId: 20,
      },
    ];

    prismaMock.client.orm.public.User.first.mockResolvedValue({
      id: 20,
    });

    prismaMock.client.orm.public.Task.all.mockResolvedValue(tasks);

    const result = await service.getUserTasks(
      20,
      20,
      UserRole.EMPLOYEE,
    );

    expect(result).toEqual(tasks);

    expect(
      prismaMock.client.orm.public.Task.where,
    ).toHaveBeenCalledWith({
      assignedToId: 20,
    });
  });

  it("should reject an employee accessing another user's tasks", async () => {
    prismaMock.client.orm.public.User.first.mockResolvedValue({
      id: 10,
    });

    await expect(
      service.getUserTasks(
        10,
        20,
        UserRole.EMPLOYEE,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(
      prismaMock.client.orm.public.Task.all,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when target user does not exist', async () => {
    prismaMock.client.orm.public.User.first.mockResolvedValue(
      undefined,
    );

    await expect(
      service.getUserTasks(
        999,
        20,
        UserRole.EMPLOYEE,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  // createUser

  it('should create a user with a hashed password and hide the password', async () => {
    prismaMock.client.orm.public.User.create.mockResolvedValue({
      id: 1,
      name: 'John',
      email: 'john@example.com',
      password: 'hashed-password',
      role: UserRole.EMPLOYEE,
    });

    const result = await service.createUser({
      name: 'John',
      email: 'john@example.com',
      password: 'Password123!',
      role: UserRole.EMPLOYEE,
    });

    expect(result).toEqual({
      id: 1,
      name: 'John',
      email: 'john@example.com',
      role: UserRole.EMPLOYEE,
    });

    expect(
      prismaMock.client.orm.public.User.create,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John',
        email: 'john@example.com',
        role: UserRole.EMPLOYEE,
        password: expect.any(String),
      }),
    );

    const createCall =
      prismaMock.client.orm.public.User.create.mock.calls[0][0];

    expect(createCall.password).not.toBe('Password123!');
  });

  // updateUser

  it('should update an existing user and hide the password', async () => {
    prismaMock.client.orm.public.User.update.mockResolvedValue({
      id: 1,
      name: 'Updated John',
      email: 'john@example.com',
      password: 'hashed-password',
      role: UserRole.MANAGER,
    });

    const result = await service.updateUser(1, {
      name: 'Updated John',
      role: UserRole.MANAGER,
    });

    expect(result).toEqual({
      id: 1,
      name: 'Updated John',
      email: 'john@example.com',
      role: UserRole.MANAGER,
    });

    expect(
      prismaMock.client.orm.public.User.where,
    ).toHaveBeenCalledWith({ id: 1 });

    expect(
      prismaMock.client.orm.public.User.update,
    ).toHaveBeenCalledWith({
      name: 'Updated John',
      role: UserRole.MANAGER,
    });
  });

  it('should throw NotFoundException when updating a nonexistent user', async () => {
    prismaMock.client.orm.public.User.update.mockResolvedValue(
      undefined,
    );

    await expect(
      service.updateUser(999, {
        name: 'Updated',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  // deleteUser

  it('should delete an existing user', async () => {
    prismaMock.client.orm.public.User.delete.mockResolvedValue({
      id: 1,
    });

    const result = await service.deleteUser(1);

    expect(result).toBeUndefined();

    expect(
      prismaMock.client.orm.public.User.where,
    ).toHaveBeenCalledWith({ id: 1 });

    expect(
      prismaMock.client.orm.public.User.delete,
    ).toHaveBeenCalled();
  });

  it('should throw NotFoundException when deleting a nonexistent user', async () => {
    prismaMock.client.orm.public.User.delete.mockResolvedValue(
      undefined,
    );

    await expect(
      service.deleteUser(999),
    ).rejects.toThrow(NotFoundException);
  });
});