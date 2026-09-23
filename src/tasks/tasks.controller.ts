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
  ParseIntPipe,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '../users/dto/create-user.dto.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { TaskResponseDto } from './dto/task-response.dto.js';
import { TaskCompanyResponseDto } from './dto/task-company-response.dto.js';
import { TaskUserResponseDto } from './dto/task-user-response.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskQueryDto } from './dto/task-query.dto.js';
import { TasksService } from './tasks.service.js';
import type { AuthenticatedRequest } from '../auth/auth.guard.js';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Get all tasks
  @ApiOperation({
    summary: 'Get all tasks',
    description:
      'Returns a paginated list of tasks with optional filtering, date-range filtering, sorting, and pagination. EMPLOYEE can only see their own tasks.',
  })
  @ApiOkResponse({
    description: 'Tasks returned successfully.',
    type: [TaskResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Query parameters are invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get()
  getAllTasks(
    @Query() query: TaskQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tasksService.getAllTasks(
      query,
      request.user.sub,
      request.user.role,
    );
  }

  // Get task by ID
  @ApiOperation({
    summary: 'Get task by ID',
    description: 'Returns a single task using its unique identifier. EMPLOYEE can only access their own tasks.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task identifier.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Task found successfully.',
    type: TaskResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Task ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to access this task.',
  })
  @ApiNotFoundResponse({
    description: 'Task not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get(':id')
  getTaskById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tasksService.getTaskById(
      id,
      request.user.sub,
      request.user.role,
    );
  }

  // Get task with company
  @ApiOperation({
    summary: 'Get task with company',
    description: 'Returns a task together with the company associated with it. EMPLOYEE can only access their own tasks.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task identifier.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Task and company returned successfully.',
    type: TaskCompanyResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Task ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'You cannot access this task.',
  })
  @ApiNotFoundResponse({
    description: 'Task not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get(':id/company')
  getTaskCompany(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tasksService.getTaskCompany(
      id,
      request.user.sub,
      request.user.role,
    );
  }

  // Get task with assigned user
  @ApiOperation({
    summary: 'Get task with assigned user',
    description: 'Returns a task together with the user assigned to it. EMPLOYEE can only access their own tasks.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task identifier.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Task and assigned user returned successfully.',
    type: TaskUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Task ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'You cannot access this task.',
  })
  @ApiNotFoundResponse({
    description: 'Task not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get(':id/user')
  getTaskUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tasksService.getTaskUser(
      id,
      request.user.sub,
      request.user.role,
    );
  }

  // Create task
  @ApiOperation({
    summary: 'Create task',
    description:
      'Creates a new task. EMPLOYEE can only create tasks for themselves. ADMIN and MANAGER can create tasks for any user.',
  })
  @ApiCreatedResponse({
    description: 'Task created successfully.',
    type: TaskResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Request data is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to create this task.',
  })
  @ApiNotFoundResponse({
    description: 'Referenced company or user was not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Post()
  createTask(@Body() dto: CreateTaskDto, @Req() request: AuthenticatedRequest) {
    return this.tasksService.createTask(
      dto,
      request.user.sub,
      request.user.role,
    );
  }

  // Update task
  @ApiOperation({
    summary: 'Update task',
    description: 'Updates an existing task. Only provided fields are changed. EMPLOYEE can only update their own tasks but cannot change assigned company. ADMIN and MANAGER can update any task.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task identifier.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Task updated successfully.',
    type: TaskResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Task ID or request data is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to update this task.',
  })
  @ApiNotFoundResponse({
    description: 'Task or referenced user was not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Patch(':id')
  updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tasksService.updateTask(
      id,
      request.user.sub,
      request.user.role,
      dto,
    );
  }

  // Delete task
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Delete task',
    description:
      'Deletes a task. Only ADMIN and MANAGER users can delete tasks.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task identifier.',
    example: 1,
  })
  @ApiNoContentResponse({
    description: 'Task deleted successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Task ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only ADMIN and MANAGER users can delete tasks.',
  })
  @ApiNotFoundResponse({
    description: 'Task not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTask(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.deleteTask(id);
  }
}
