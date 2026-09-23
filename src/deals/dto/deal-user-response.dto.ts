import { ApiProperty } from '@nestjs/swagger';

import { DealResponseDto } from './deal-response.dto.js';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';

export class DealUserResponseDto extends DealResponseDto {
  @ApiProperty({
    type: UserResponseDto,
    nullable: true,
    description: 'User assigned to the deal.',
  })
  assignedTo: UserResponseDto | null;
}