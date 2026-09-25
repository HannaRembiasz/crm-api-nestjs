import { IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsAfterOrEqual } from '../../common/validation/is-after-or-equal.decorator.js';

export class StatsQueryDto {
  @ApiPropertyOptional({
    description: 'Include statistics from this date.',
  })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    description:
      'Include statistics up to and including this date. Must be greater than or equal to from.',
  })
  @IsDateString()
  @IsOptional()
  @IsAfterOrEqual('from', {
    message: 'to must be greater than or equal to from',
  })
  to?: string;
}