import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsDateString,
  IsIn,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { TaskPriority } from './create-task.dto.js';
import { TaskStatus } from './update-task.dto.js';
import { IsAfterOrEqual } from '../../common/validation/is-after-or-equal.decorator.js';

export class TaskQueryDto {
  @ApiPropertyOptional({
    example: 'Call',
    description: 'Filter tasks by title.',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    example: '2026-09-01T00:00:00.000Z',
    description: 'Return tasks due on or after this date.',
  })
  @IsDateString()
  @IsOptional()
  dueAfter?: string;

  @ApiPropertyOptional({
    example: '2026-09-30T23:59:59.999Z',
    description:
      'Return tasks due on or before this date. Must be greater than or equal to dueAfter.',
  })
  @IsDateString()
  @IsOptional()
  @IsAfterOrEqual('dueAfter', {
    message: 'dueBefore must be greater than or equal to dueAfter',
  })
  dueBefore?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter tasks by company ID.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @ApiPropertyOptional({
    example: 7,
    description: 'Filter tasks by assigned user ID.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assignedToId?: number;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    minimum: 1,
    description: 'Page number.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
    description: 'Number of tasks per page.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: ['title', 'status', 'priority', 'dueDate', 'createdAt'],
    example: 'createdAt',
    default: 'createdAt',
    description: 'Field used to sort the results.',
  })
  @IsOptional()
  @IsIn(['title', 'status', 'priority', 'dueDate', 'createdAt'])
  sortBy?: 'title' | 'status' | 'priority' | 'dueDate' | 'createdAt' =
    'createdAt';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    example: 'asc',
    default: 'asc',
    description: 'Sort direction.',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
