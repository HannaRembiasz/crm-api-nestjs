import { Controller, Get, Param, Post, Body, Patch, Delete, Query } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskQueryDto } from './dto/task-query.dto.js';
import { TasksService } from './tasks.service.js';

@Controller('tasks')
export class TasksController {
constructor(private readonly tasksService: TasksService) {}

@Get()
getAllTasks(@Query() query: TaskQueryDto) {
    return this.tasksService.getAllTasks(query);
}

@Get(':id')
getTaskById(@Param('id') id: number) {
    return this.tasksService.getTaskById(id);
}

@Post()
createTask(@Body() dto: CreateTaskDto) {
    return this.tasksService.createTask(dto);
}

@Patch(':id')
updateTask(@Param('id') id: number, @Body() dto: UpdateTaskDto) {
    return this.tasksService.updateTask(id, dto);
}

@Delete(':id')
deleteTask(@Param('id') id: number) {
    return this.tasksService.deleteTask(id);
}

}
    