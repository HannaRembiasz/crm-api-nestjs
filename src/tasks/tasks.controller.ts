import { Controller, Get, Param } from '@nestjs/common';
import { TasksService } from './tasks.service.js';

@Controller('tasks')
export class TasksController {
constructor(private readonly tasksService: TasksService) {}

@Get()
getAllTasks() {
    return this.tasksService.getAllTasks();
}
}
