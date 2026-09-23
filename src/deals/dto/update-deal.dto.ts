import { DealStatus } from './create-deal.dto.js';

import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDealDto {
  @ApiPropertyOptional({
    example: 'Website redesign project',
    description: 'Deal title.',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({
    example: '20000.00',
    description: 'Deal value.',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  value?: string;

  @ApiPropertyOptional({
    enum: DealStatus,
    example: DealStatus.NEGOTIATION,
    description:
      'Current deal status. EMPLOYEE can update the status of their own open deals, but cannot change a WON or LOST deal to another status.',
  })
  @IsEnum(DealStatus)
  @IsOptional()
  @IsNotEmpty()
  status?: DealStatus;

  @ApiPropertyOptional({
    example: 7,
    description: 'ID of the user assigned to the deal.',
  })
  @IsInt()
  @IsOptional()
  @IsNotEmpty()
  assignedToId?: number;
}
