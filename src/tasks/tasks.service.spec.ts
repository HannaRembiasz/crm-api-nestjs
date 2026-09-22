import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from '../users/dto/create-user.dto.js';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { vi } from 'vitest';
import { TaskStatus } from './dto/update-task.dto.js';
import { TaskPriority } from './dto/create-task.dto.js';

describe('TasksService', () => {
  let service: TasksService;

  const prismaMock = {
    client: {
      orm: {
        public: {
          Task: {
            first: vi.fn(),
            where: vi.fn(),
            include: vi.fn(),
            orderBy: vi.fn(),
            limit: vi.fn(),
            offset: vi.fn(),
            all: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
            update: vi.fn(),
          },
          Company: {
            first: vi.fn(),
          },
          User: {
            first: vi.fn(),
          },
        },
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);

    vi.clearAllMocks();
    const taskQuery = prismaMock.client.orm.public.Task;

    taskQuery.where.mockReturnValue(taskQuery);
    taskQuery.include.mockReturnValue(taskQuery);
    taskQuery.orderBy.mockReturnValue(taskQuery);
    taskQuery.limit.mockReturnValue(taskQuery);
    taskQuery.offset.mockReturnValue(taskQuery);
  });

  // Tests for task access based on employee permissions
  it('should reject an employee accessing another employee task', async () => {
    prismaMock.client.orm.public.Task.first.mockResolvedValue({
      id: 1,
      title: 'Test task',
      assignedToId: 10,
    });

    await expect(service.getTaskById(1, 20, UserRole.EMPLOYEE)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should allow an employee to access their assigned task', async () => {
    const task = {
      id: 1,
      title: 'Test task',
      assignedToId: 20,
    };

    prismaMock.client.orm.public.Task.first.mockResolvedValue(task);

    const result = await service.getTaskById(1, 20, UserRole.EMPLOYEE);

    expect(result).toEqual(task);
  });

  // Tests for task not found scenario
  it('should throw NotFoundException when task does not exist', async () => {
    prismaMock.client.orm.public.Task.first.mockResolvedValue(undefined);

    await expect(
      service.getTaskById(999, 20, UserRole.EMPLOYEE),
    ).rejects.toThrow(NotFoundException);
  });

  // Tests for retrieving all tasks assigned to the employee
  it('should return only tasks assigned to the employee', async () => {
    const tasks = [
      {
        id: 1,
        title: 'Employee task',
        assignedToId: 20,
      },
    ];

    prismaMock.client.orm.public.Task.all.mockResolvedValue(tasks);

    const result = await service.getAllTasks({}, 20, UserRole.EMPLOYEE);

    expect(result).toEqual(tasks);

    expect(prismaMock.client.orm.public.Task.where).toHaveBeenCalledWith({
      assignedToId: 20,
    });
  });

  // Tests for retrieving tasks filtered by assignedToId for a manager
  it('should filter tasks by assignedToId for a manager', async () => {
    const tasks = [
      {
        id: 1,
        title: 'Employee task',
        assignedToId: 20,
      },
    ];

    prismaMock.client.orm.public.Task.all.mockResolvedValue(tasks);

    const result = await service.getAllTasks(
      {
        assignedToId: 20,
      },
      1,
      UserRole.MANAGER,
    );

    expect(result).toEqual(tasks);

    expect(prismaMock.client.orm.public.Task.where).toHaveBeenCalledWith({
      assignedToId: 20,
    });
  });

  // Tests for applying various task query filters
  it('should apply task query filters', async () => {
    prismaMock.client.orm.public.Task.all.mockResolvedValue([]);

    await service.getAllTasks(
      {
        title: 'important',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        companyId: 5,
        dueAfter: '2026-09-01',
        dueBefore: '2026-09-30',
      },
      1,
      UserRole.MANAGER,
    );

    const whereMock = prismaMock.client.orm.public.Task.where;

    expect(whereMock).toHaveBeenCalledTimes(6);

    expect(whereMock).toHaveBeenNthCalledWith(1, expect.any(Function));

    expect(whereMock).toHaveBeenNthCalledWith(2, {
      status: TaskStatus.IN_PROGRESS,
    });

    expect(whereMock).toHaveBeenNthCalledWith(3, {
      priority: TaskPriority.HIGH,
    });

    expect(whereMock).toHaveBeenNthCalledWith(4, expect.any(Function));
    expect(whereMock).toHaveBeenNthCalledWith(5, expect.any(Function));

    expect(whereMock).toHaveBeenNthCalledWith(6, {
      companyId: 5,
    });
  });

  // Tests for applying pagination and sorting
  it('should apply pagination and sorting', async () => {
    prismaMock.client.orm.public.Task.all.mockResolvedValue([]);

    await service.getAllTasks(
      {
        page: 2,
        limit: 5,
        sortBy: 'title',
        sortOrder: 'desc',
      },
      1,
      UserRole.MANAGER,
    );

    expect(prismaMock.client.orm.public.Task.orderBy).toHaveBeenCalledTimes(1);

    expect(prismaMock.client.orm.public.Task.limit).toHaveBeenCalledWith(5);

    expect(prismaMock.client.orm.public.Task.offset).toHaveBeenCalledWith(5);

    expect(prismaMock.client.orm.public.Task.all).toHaveBeenCalledTimes(1);
  });

  // Tests for retrieving the company of an accessible task
  it('should return the company for an accessible task', async () => {
    const task = {
      id: 1,
      assignedToId: 20,
      company: {
        id: 5,
        name: 'Test Company',
      },
    };

    prismaMock.client.orm.public.Task.first.mockResolvedValue(task);

    const result = await service.getTaskCompany(1, 20, UserRole.EMPLOYEE);

    expect(result).toEqual(task);
    expect(prismaMock.client.orm.public.Task.where).toHaveBeenCalledWith({
      id: 1,
    });
    expect(prismaMock.client.orm.public.Task.include).toHaveBeenCalledWith(
      'company',
    );
  });

  // Tests for rejecting an employee accessing the company of another employee task
  it('should reject an employee accessing the company of another employee task', async () => {
    prismaMock.client.orm.public.Task.first.mockResolvedValue({
      id: 1,
      assignedToId: 10,
      company: {
        id: 5,
        name: 'Test Company',
      },
    });

    await expect(
      service.getTaskCompany(1, 20, UserRole.EMPLOYEE),
    ).rejects.toThrow(ForbiddenException);
  });

  // Tests for rejecting an employee accessing the assigned user of another employee task
  it('should return the assigned user for an accessible task', async () => {
    const task = {
      id: 1,
      assignedToId: 20,
      assignedTo: {
        id: 20,
        name: 'Employee',
      },
    };

    prismaMock.client.orm.public.Task.first.mockResolvedValue(task);

    const result = await service.getTaskUser(1, 20, UserRole.EMPLOYEE);

    expect(result).toEqual(task);
    expect(prismaMock.client.orm.public.Task.where).toHaveBeenCalledWith({
      id: 1,
    });
    expect(prismaMock.client.orm.public.Task.include).toHaveBeenCalledWith(
      'assignedTo',
    );
  });

  // Tests for rejecting an employee accessing the user of another employee task
  it('should reject an employee accessing the user of another employee task', async () => {
    prismaMock.client.orm.public.Task.first.mockResolvedValue({
      id: 1,
      assignedToId: 10,
      assignedTo: {
        id: 10,
        name: 'Other Employee',
      },
    });

    await expect(service.getTaskUser(1, 20, UserRole.EMPLOYEE)).rejects.toThrow(
      ForbiddenException,
    );
  });

  // Tests for assigning a task to the employee creating it
  it('should assign a task to the employee creating it', async () => {
  prismaMock.client.orm.public.User.first.mockResolvedValue({
    id: 20,
  });

  prismaMock.client.orm.public.Task.create.mockResolvedValue({
    id: 1,
    title: 'Employee task',
    assignedToId: 20,
  });

  const result = await service.createTask(
    {
      title: 'Employee task',
    },
    20,
    UserRole.EMPLOYEE,
  );

  expect(result.assignedToId).toBe(20);

  expect(prismaMock.client.orm.public.Task.create).toHaveBeenCalledWith({
    title: 'Employee task',
    assignedToId: 20,
  });
});

  // Tests for rejecting a manager creating a task without assignedToId
it('should reject a manager creating a task without assignedToId', async () => {
  await expect(
    service.createTask(
      {
        title: 'Manager task',
      },
      1,
      UserRole.MANAGER,
    ),
  ).rejects.toThrow(BadRequestException);
});

  // Tests for rejecting a task with a nonexistent company
it('should reject a task with a nonexistent company', async () => {
  prismaMock.client.orm.public.Company.first.mockResolvedValue(undefined);

  await expect(
    service.createTask(
      {
        title: 'Task',
        companyId: 999,
        assignedToId: 20,
      },
      1,
      UserRole.MANAGER,
    ),
  ).rejects.toThrow(NotFoundException);

  expect(prismaMock.client.orm.public.Company.first)
    .toHaveBeenCalledWith({ id: 999 });
});

  // Tests for rejecting a task with a nonexistent assigned user
it('should reject a task with a nonexistent assigned user', async () => {
  prismaMock.client.orm.public.User.first.mockResolvedValue(undefined);

  await expect(
    service.createTask(
      {
        title: 'Task',
        assignedToId: 999,
      },
      1,
      UserRole.MANAGER,
    ),
  ).rejects.toThrow(NotFoundException);

  expect(prismaMock.client.orm.public.User.first)
    .toHaveBeenCalledWith({ id: 999 });
});

  // Tests for deleting an existing task
it('should delete an existing task', async () => {
  prismaMock.client.orm.public.Task.delete.mockResolvedValue({
    id: 1,
  });

  const result = await service.deleteTask(1);

  expect(result).toBeUndefined();

  expect(prismaMock.client.orm.public.Task.where)
    .toHaveBeenCalledWith({ id: 1 });

  expect(prismaMock.client.orm.public.Task.delete)
    .toHaveBeenCalled();
});

  // Tests for deleting a nonexistent task
it('should throw NotFoundException when deleting a nonexistent task', async () => {
  prismaMock.client.orm.public.Task.delete.mockResolvedValue(undefined);

  await expect(
    service.deleteTask(999),
  ).rejects.toThrow(NotFoundException);

  expect(prismaMock.client.orm.public.Task.where)
    .toHaveBeenCalledWith({ id: 999 });
});

  // Tests for updating a task by an employee
it('should allow an employee to update their own task', async () => {
  const task = {
    id: 1,
    title: 'Old title',
    assignedToId: 20,
    status: TaskStatus.TODO,
  };

  const updatedTask = {
    ...task,
    title: 'New title',
  };

  prismaMock.client.orm.public.Task.first.mockResolvedValue(task);
  prismaMock.client.orm.public.Task.update.mockResolvedValue(updatedTask);

  const result = await service.updateTask(
    1,
    20,
    UserRole.EMPLOYEE,
    {
      title: 'New title',
    },
  );

  expect(result).toEqual(updatedTask);

  expect(prismaMock.client.orm.public.Task.update)
    .toHaveBeenCalledWith({
      title: 'New title',
    });
});

  // Tests for rejecting an employee updating another employee's task
it('should reject an employee updating another employee task', async () => {
  prismaMock.client.orm.public.Task.first.mockResolvedValue({
    id: 1,
    title: 'Other task',
    assignedToId: 10,
    status: TaskStatus.TODO,
  });

  await expect(
    service.updateTask(
      1,
      20,
      UserRole.EMPLOYEE,
      {
        title: 'New title',
      },
    ),
  ).rejects.toThrow(ForbiddenException);

  expect(prismaMock.client.orm.public.Task.update)
    .not.toHaveBeenCalled();
});

  // Tests for rejecting an employee reassigning a task
it('should reject an employee reassigning a task', async () => {
  prismaMock.client.orm.public.Task.first.mockResolvedValue({
    id: 1,
    title: 'Test task',
    assignedToId: 20,
    status: TaskStatus.TODO,
  });

  await expect(
    service.updateTask(
      1,
      20,
      UserRole.EMPLOYEE,
      {
        assignedToId: 30,
      },
    ),
  ).rejects.toThrow(ForbiddenException);

  expect(prismaMock.client.orm.public.Task.update)
    .not.toHaveBeenCalled();
});


  // Tests for rejecting an employee moving an in-progress task back to todo
it('should reject an employee moving an in-progress task back to todo', async () => {
  prismaMock.client.orm.public.Task.first.mockResolvedValue({
    id: 1,
    title: 'Test task',
    assignedToId: 20,
    status: TaskStatus.IN_PROGRESS,
  });

  await expect(
    service.updateTask(
      1,
      20,
      UserRole.EMPLOYEE,
      {
        status: TaskStatus.TODO,
      },
    ),
  ).rejects.toThrow(ForbiddenException);

  expect(prismaMock.client.orm.public.Task.update)
    .not.toHaveBeenCalled();
});

  // Tests for rejecting an employee reopening a completed task
it('should reject an employee reopening a completed task', async () => {
  prismaMock.client.orm.public.Task.first.mockResolvedValue({
    id: 1,
    title: 'Completed task',
    assignedToId: 20,
    status: TaskStatus.DONE,
  });

  await expect(
    service.updateTask(
      1,
      20,
      UserRole.EMPLOYEE,
      {
        status: TaskStatus.IN_PROGRESS,
      },
    ),
  ).rejects.toThrow(ForbiddenException);

  expect(prismaMock.client.orm.public.Task.update)
    .not.toHaveBeenCalled();
});
});
