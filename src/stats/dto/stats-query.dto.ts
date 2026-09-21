import { IsDateString, IsOptional } from 'class-validator';

export class StatsQueryDto {
  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}