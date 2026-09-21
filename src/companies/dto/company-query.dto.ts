import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';

export class CompanyQueryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

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

  @IsIn(['name', 'city', 'country', 'createdAt'])
  @IsOptional()
  sortBy?: 'name' | 'city' | 'country' | 'createdAt' = 'name';

  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
