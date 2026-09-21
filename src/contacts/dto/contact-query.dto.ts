import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';

export class ContactQueryDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  companyId?: number;

    @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @IsIn(['firstName', 'lastName', 'email', 'createdAt'])
  @IsOptional()
  sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt' = 'firstName';

  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
