import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '../users/dto/create-user.dto.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskQueryDto } from './dto/task-query.dto.js';
import { TasksService } from './tasks.service.js';
import type { AuthenticatedRequest } from '../auth/auth.guard.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  getAllTasks(@Query() query: TaskQueryDto, @Req() request: AuthenticatedRequest) {
    return this.tasksService.getAllTasks(query, request.user.sub, request.user.role);
  }

  @Get(':id')
  getTaskById(@Param('id') id: number, @Req() request: AuthenticatedRequest) {
    return this.tasksService.getTaskById(id, request.user.sub, request.user.role);
  }

  @Get(':id/company')
  getTaskCompany(@Param('id') id: number, @Req() request: AuthenticatedRequest) {
    return this.tasksService.getTaskCompany(id, request.user.sub, request.user.role);
  }

  @Get(':id/user')
  getTaskUser(@Param('id') id: number, @Req() request: AuthenticatedRequest) {
    return this.tasksService.getTaskUser(id, request.user.sub, request.user.role);
  }

  @Post()
  createTask(@Body() dto: CreateTaskDto, @Req() request: AuthenticatedRequest) {
    return this.tasksService.createTask(dto, request.user.sub, request.user.role);
  }

  @Patch(':id')
  updateTask(@Param('id') id: number, @Body() dto: UpdateTaskDto, @Req() request: AuthenticatedRequest) {
    return this.tasksService.updateTask(id, request.user.sub, request.user.role, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTask(@Param('id') id: number) {
    return this.tasksService.deleteTask(id);
  }
}
