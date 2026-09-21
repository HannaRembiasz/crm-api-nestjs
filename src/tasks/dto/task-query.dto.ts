import { TaskPriority } from './create-task.dto.js';
import { TaskStatus } from './update-task.dto.js';
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
import { IsAfterOrEqual } from '../../common/validation/is-after-or-equal.decorator.js';

export class TaskQueryDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  dueAfter?: string;

  @IsDateString()
  @IsOptional()
  @IsAfterOrEqual('dueAfter', {
    message: 'dueBefore must be greater than or equal to dueAfter',
  })
  dueBefore?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assignedToId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsIn(['title', 'status', 'priority', 'dueDate', 'createdAt'])
  sortBy?: 'title' | 'status' | 'priority' | 'dueDate' | 'createdAt' =
    'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
