export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  IsDateString,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  description?: string;

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
  companyId?: number;

  @IsInt()
  @IsOptional()
  @IsNotEmpty()
  assignedToId?: number;
}
