export enum DealStatus {
    LEAD = 'LEAD',
    CONTACTED = 'CONTACTED',
    PROPOSAL = 'PROPOSAL',
    NEGOTIATION = 'NEGOTIATION',
    WON = 'WON',
    LOST = 'LOST',
}

import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateDealDto {
  @ApiProperty({
    example: 'Website redesign project',
    description: 'Deal title.',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: '15000.00',
    description: 'Deal value.',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  value?: string;

  @ApiProperty({
    enum: DealStatus,
    example: DealStatus.LEAD,
    description: 'Initial deal status.',
  })
  @IsEnum(DealStatus)
  @IsNotEmpty()
  status: DealStatus;

  @ApiProperty({
    example: 1,
    description: 'ID of the company associated with the deal.',
  })
  @IsInt()
  @IsNotEmpty()
  companyId: number;

  @ApiPropertyOptional({
    example: 7,
    description: 'ID of the user assigned to the deal.',
  })
  @IsInt()
  @IsOptional()
  @IsNotEmpty()
  assignedToId?: number;
}