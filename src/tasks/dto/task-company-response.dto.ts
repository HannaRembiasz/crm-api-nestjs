import { ApiProperty } from '@nestjs/swagger';

import { TaskResponseDto } from './task-response.dto.js';
import { CompanyResponseDto } from '../../companies/dto/company-response.dto.js';

export class TaskCompanyResponseDto extends TaskResponseDto {
  @ApiProperty({
    type: CompanyResponseDto,
    nullable: true,
    description: 'Company associated with the task.',
  })
  company: CompanyResponseDto | null;
}