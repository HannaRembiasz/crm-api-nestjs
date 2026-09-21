import { IsDateString, IsOptional } from 'class-validator';
import { IsAfterOrEqual } from '../../common/validation/is-after-or-equal.decorator.js';

export class StatsQueryDto {
  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  @IsAfterOrEqual('from', {
    message: 'to must be greater than or equal to from',
  })
  to?: string;
}
