import { DealStatus } from './create-deal.dto.js';

import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';

import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DealQueryDto {
  @ApiPropertyOptional({
    example: 'Website',
    description: 'Filter deals by title.',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    enum: DealStatus,
    example: DealStatus.NEGOTIATION,
    description: 'Filter deals by status.',
  })
  @IsEnum(DealStatus)
  @IsOptional()
  status?: DealStatus;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter deals by company ID.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @ApiPropertyOptional({
    example: 7,
    description: 'Filter deals by assigned user ID.',
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
    description: 'Number of deals per page.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: ['title', 'status', 'value', 'createdAt'],
    example: 'createdAt',
    default: 'createdAt',
    description: 'Field used to sort the results.',
  })
  @IsOptional()
  @IsIn(['title', 'status', 'value', 'createdAt'])
  sortBy?: 'title' | 'status' | 'value' | 'createdAt' = 'createdAt';

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