import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  getAllTasks() {
    return this.prisma.client.orm.public.Task.all();
  }
}
