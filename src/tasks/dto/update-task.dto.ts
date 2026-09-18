import { TaskPriority } from './create-task.dto.js';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  IsDateString,
} from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  title?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  @IsNotEmpty()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  @IsNotEmpty()
  priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  @IsNotEmpty()
  dueDate?: string;

  @IsInt()
  @IsOptional()
  @IsNotEmpty()
  assignedToId?: number;
}