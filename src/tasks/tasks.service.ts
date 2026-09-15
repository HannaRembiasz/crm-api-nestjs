import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  getAllTasks() {
    return this.prisma.client.orm.public.Task.all();
  }

  getTaskById(id: number) {
    return this.prisma.client.orm.public.Task.first({ id: id });
  }

  createTask(dto: CreateTaskDto) {
    return this.prisma.client.orm.public.Task.create(dto)
  }

  updateTask(id: number, dto: UpdateTaskDto) {
    return this.prisma.client.orm.public.Task.where({ id: id }).update(dto);
  }

  deleteTask(id: number) {
    return this.prisma.client.orm.public.Task.where({ id: id }).delete();
  }
}
