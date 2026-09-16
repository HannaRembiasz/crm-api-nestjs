import { DealStatus } from './create-deal.dto.js';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DealQueryDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(DealStatus)
  @IsOptional()
  status?: DealStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assignedToId?: number;
}