import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskQueryDto } from './dto/task-query.dto.js';
import { UserRole } from '../users/dto/create-user.dto.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllTasks(query: TaskQueryDto, userId: number, userRole: UserRole) {
    let tasks = this.prisma.client.orm.public.Task;

    if (userRole === UserRole.EMPLOYEE) {
      tasks = tasks.where({ assignedToId: userId });
    } else if (query.assignedToId) {
      tasks = tasks.where({ assignedToId: query.assignedToId });
    }

    if (query.title) {
      tasks = tasks.where((task) => task.title.ilike(`%${query.title}%`));
    }

    if (query.status) {
      tasks = tasks.where({ status: query.status });
    }

    if (query.priority) {
      tasks = tasks.where({ priority: query.priority });
    }

    if (query.dueAfter) {
      const dueAfter = query.dueAfter;
      tasks = tasks.where((task) => task.dueDate.gte(dueAfter));
    }

    if (query.dueBefore) {
      const dueBefore = query.dueBefore;
      tasks = tasks.where((task) => task.dueDate.lte(dueBefore));
    }

    if (query.companyId) {
      tasks = tasks.where({ companyId: query.companyId });
    }


    return tasks.all();
  }

  async getTaskById(id: number, userId: number, userRole: UserRole) {
    const task = await this.prisma.client.orm.public.Task.first({ id });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (userRole === UserRole.EMPLOYEE && task.assignedToId !== userId) {
      throw new ForbiddenException('You cannot access this task');
    }

    return task;
  }

  async getTaskCompany(id: number, userId: number, userRole: UserRole) {
    const task = await this.prisma.client.orm.public.Task.where({ id: id })
      .include('company')
      .first();

    if (!task) {
      throw new NotFoundException(`Task not found`);
    }

    if (userRole === UserRole.EMPLOYEE && task.assignedToId !== userId) {
      throw new ForbiddenException('You cannot access this task');
    }
    return task;
  }

  async getTaskUser(id: number, userId: number, userRole: UserRole) {
    const task = await this.prisma.client.orm.public.Task.where({ id: id })
      .include('assignedTo')
      .first();

    if (!task) {
      throw new NotFoundException(`Task not found`);
    }

    if (userRole === UserRole.EMPLOYEE && task.assignedToId !== userId) {
      throw new ForbiddenException('You cannot access this task');
    }

    return task;
  }

  async createTask(dto: CreateTaskDto, userId: number, userRole: UserRole) {
    let assignedToId: number;

    if (userRole === UserRole.EMPLOYEE) {
      assignedToId = userId;
    } else {
      if (dto.assignedToId === undefined) {
        throw new BadRequestException('assignedToId is required');
      }
      assignedToId = dto.assignedToId;
    }

    return this.prisma.client.orm.public.Task.create({
      ...dto,
      assignedToId,
    });
  }

  async updateTask(
    id: number,
    userId: number,
    userRole: UserRole,
    dto: UpdateTaskDto,
  ) {
    const task = await this.prisma.client.orm.public.Task.where({ id }).first();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (userRole === UserRole.EMPLOYEE && task.assignedToId !== userId) {
      throw new ForbiddenException('You cannot access this task');
    }

    const updatedTask = await this.prisma.client.orm.public.Task.where({
      id: id,
    }).update(dto);

    return updatedTask;
  }

  async deleteTask(id: number) {
    const task = await this.prisma.client.orm.public.Task.where({
      id: id,
    }).delete();

    if (!task) {
      throw new NotFoundException(`Task not found`);
    }

    return;
  }
}
