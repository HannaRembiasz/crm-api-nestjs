import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskQueryDto } from './dto/task-query.dto.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllTasks(query: TaskQueryDto) {
    let tasks = this.prisma.client.orm.public.Task;
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

    if (query.assignedToId) {
      tasks = tasks.where({ assignedToId: query.assignedToId });
    }

    return tasks.all();
  }

  async getTaskById(id: number) {
    const task = await this.prisma.client.orm.public.Task.first({ id: id });

    if (!task) {
      throw new NotFoundException(`Task not found`);
    }

    return task;
  }

  async getTaskCompany(id: number) {
    const task = await this.prisma.client.orm.public.Task.where({ id: id }).include('company').first();

    if (!task) {
      throw new NotFoundException(`Task not found`);
    }

    return task;
  }

  async getTaskUser(id: number) {
    const task = await this.prisma.client.orm.public.Task.where({ id: id }).include('assignedTo').first();

    if (!task) {
      throw new NotFoundException(`Task not found`);
    }

    return task;
  }

  async createTask(dto: CreateTaskDto) {
    return this.prisma.client.orm.public.Task.create(dto);
  }

  async updateTask(id: number, dto: UpdateTaskDto) {
    const task = await this.prisma.client.orm.public.Task.where({ id: id }).update(dto);

    if (!task) {
      throw new NotFoundException(`Task not found`);
    }

    return task;
  }

  async deleteTask(id: number) {
    const task = await this.prisma.client.orm.public.Task.where({ id: id }).delete();

    if (!task) {
      throw new NotFoundException(`Task not found`);
    }

    return;
  }
}
