import { DealStatus } from './create-deal.dto.js';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
} from 'class-validator';

export class UpdateDealDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  title?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  value?: string;

  @IsEnum(DealStatus)
  @IsOptional()
  @IsNotEmpty()
  status?: DealStatus;

  @IsInt()
  @IsOptional()
  @IsNotEmpty()
  assignedToId?: number;
}
