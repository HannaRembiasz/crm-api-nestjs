import { ApiProperty } from '@nestjs/swagger';

class TaskStatsResponseDto {
  @ApiProperty({
    example: 20,
    description: 'Total number of tasks.',
  })
  total: number;

  @ApiProperty({
    example: 8,
    description: 'Number of tasks with TODO status.',
  })
  todo: number;

  @ApiProperty({
    example: 7,
    description: 'Number of tasks with IN_PROGRESS status.',
  })
  inProgress: number;

  @ApiProperty({
    example: 5,
    description: 'Number of tasks with DONE status.',
  })
  done: number;
}

class DealStatsResponseDto {
  @ApiProperty({
    example: 15,
    description: 'Total number of deals.',
  })
  total: number;

  @ApiProperty({
    example: 8,
    description: 'Number of open deals.',
  })
  open: number;

  @ApiProperty({
    example: 5,
    description: 'Number of won deals.',
  })
  won: number;

  @ApiProperty({
    example: 2,
    description: 'Number of lost deals.',
  })
  lost: number;
}

export class StatsOverviewResponseDto {
  @ApiProperty({
    example: 12,
    description: 'Total number of companies.',
  })
  companies: number;

  @ApiProperty({
    example: 24,
    description: 'Total number of contacts.',
  })
  contacts: number;

  @ApiProperty({
    type: TaskStatsResponseDto,
    description: 'Task statistics grouped by status.',
  })
  tasks: TaskStatsResponseDto;

  @ApiProperty({
    type: DealStatsResponseDto,
    description: 'Deal statistics grouped by outcome.',
  })
  deals: DealStatsResponseDto;
}