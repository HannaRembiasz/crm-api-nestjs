import { ApiProperty } from '@nestjs/swagger';

import { TaskResponseDto } from './task-response.dto.js';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';

export class TaskUserResponseDto extends TaskResponseDto {
  @ApiProperty({
    type: UserResponseDto,
    nullable: true,
    description: 'User assigned to the task.',
  })
  assignedTo: UserResponseDto | null;
}