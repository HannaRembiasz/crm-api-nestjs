import { TaskPriority } from './create-task.dto.js';
import { TaskStatus } from './update-task.dto.js';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  dueBefore?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assignedToId?: number;
}
