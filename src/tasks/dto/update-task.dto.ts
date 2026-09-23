import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  IsDateString,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { TaskPriority } from './create-task.dto.js';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'Call client',
    description: 'Task title.',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({
    example: 'Discuss the new contract.',
    description: 'Additional task description.',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
    description: 'Task status. EMPLOYEE can update the status of their own tasks, but cannot move IN_PROGRESS back to TODO or reopen a completed task (DONE).',
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  @IsNotEmpty()
  status?: TaskStatus;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    description: 'Task priority.',
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  @IsNotEmpty()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    example: '2026-10-01T10:00:00.000Z',
    description: 'Task due date.',
  })
  @IsDateString()
  @IsOptional()
  @IsNotEmpty()
  dueDate?: string;

  @ApiPropertyOptional({
    example: 7,
    description: 'ID of the user to assign the task to.',
  })
  @IsInt()
  @IsOptional()
  @IsNotEmpty()
  assignedToId?: number;
}
