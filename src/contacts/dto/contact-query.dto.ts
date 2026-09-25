import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';

export class ContactQueryDto {
  @ApiPropertyOptional({
    description: 'Filter contacts by first name.',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Filter contacts by last name.',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Filter contacts by email address.',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filter contacts by company ID.',
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  companyId?: number;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    minimum: 1,
    description: 'Page number.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
    description: 'Number of contacts per page.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: ['firstName', 'lastName', 'email', 'createdAt'],
    example: 'firstName',
    default: 'firstName',
    description: 'Field used to sort the results.',
  })
  @IsIn(['firstName', 'lastName', 'email', 'createdAt'])
  @IsOptional()
  sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt' = 'firstName';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    example: 'asc',
    default: 'asc',
    description: 'Sort direction.',
  })
  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'asc';
}