import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskQueryDto } from './dto/task-query.dto.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  getAllTasks(query: TaskQueryDto) {
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

  getTaskById(id: number) {
    return this.prisma.client.orm.public.Task.first({ id: id });
  }

  getTaskCompany(id: number) {
    return this.prisma.client.orm.public.Task.where({ id: id }).include('company').first();
  }

  createTask(dto: CreateTaskDto) {
    return this.prisma.client.orm.public.Task.create(dto);
  }

  updateTask(id: number, dto: UpdateTaskDto) {
    return this.prisma.client.orm.public.Task.where({ id: id }).update(dto);
  }

  deleteTask(id: number) {
    return this.prisma.client.orm.public.Task.where({ id: id }).delete();
  }
}
