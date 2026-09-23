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

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Call client',
    description: 'Task title.',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'Discuss the new contract.',
    description: 'Additional task description.',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  description?: string;

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
    example: 1,
    description: 'ID of the company associated with the task.',
  })
  @IsInt()
  @IsOptional()
  @IsNotEmpty()
  companyId?: number;

  @ApiPropertyOptional({
    example: 7,
    description: 'ID of the user assigned to the task.',
  })
  @IsInt()
  @IsOptional()
  @IsNotEmpty()
  assignedToId?: number;
}