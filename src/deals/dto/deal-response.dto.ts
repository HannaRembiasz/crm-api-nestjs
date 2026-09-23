import { ApiProperty } from '@nestjs/swagger';
import { DealStatus } from './create-deal.dto.js';

export class DealResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique deal identifier.',
  })
  id: number;

  @ApiProperty({
    example: 'Website redesign project',
    description: 'Deal title.',
  })
  title: string;

  @ApiProperty({
    enum: DealStatus,
    example: DealStatus.LEAD,
    description: 'Current deal status.',
  })
  status: DealStatus;

  @ApiProperty({
    example: '15000.00',
    description: 'Deal value.',
  })
  value: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the company associated with the deal.',
  })
  companyId: number;

  @ApiProperty({
    example: 7,
    nullable: true,
    description: 'ID of the user assigned to the deal.',
  })
  assignedToId: number | null;

  @ApiProperty({
    example: '2026-09-14 12:19:31.891653+00',
    description: 'Deal creation timestamp.',
  })
  createdAt: string;

  @ApiProperty({
    example: '2026-09-14 12:19:31.891653+00',
    description: 'Timestamp of the last deal update.',
  })
  updatedAt: string;
}