import { ApiProperty } from '@nestjs/swagger';

import { DealStatus } from '../../deals/dto/create-deal.dto.js';

type DealStatusValue = `${DealStatus}`;

class DealStatsByStatusResponseDto {
  @ApiProperty({
    enum: DealStatus,
    example: DealStatus.WON,
    description: 'Deal status.',
  })
  status: DealStatusValue;

  @ApiProperty({
    example: 5,
    description: 'Number of deals with this status.',
  })
  count: number;

  @ApiProperty({
    example: '25000.00',
    description: 'Total value of deals with this status.',
  })
  value: string;
}

export class StatsDealsResponseDto {
  @ApiProperty({
    example: 15,
    description: 'Total number of deals in the selected date range.',
  })
  totalDeals: number;

  @ApiProperty({
    example: '75000.00',
    description: 'Total value of deals in the selected date range.',
  })
  totalValue: string;

  @ApiProperty({
    type: [DealStatsByStatusResponseDto],
    description: 'Deal statistics grouped by status.',
  })
  byStatus: DealStatsByStatusResponseDto[];
}
