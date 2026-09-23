import { ApiProperty } from '@nestjs/swagger';

import { CompanyResponseDto } from './company-response.dto.js';
import { ContactResponseDto } from '../../contacts/dto/contact-response.dto.js';
import { TaskResponseDto } from '../../tasks/dto/task-response.dto.js';
import { DealResponseDto } from '../../deals/dto/deal-response.dto.js';

export class CompanyOverviewResponseDto {
  @ApiProperty({
    description: 'Company information.',
    type: CompanyResponseDto,
  })
  company: CompanyResponseDto;

  @ApiProperty({
    description: 'Contacts associated with the company.',
    type: [ContactResponseDto],
  })
  contacts: ContactResponseDto[];

  @ApiProperty({
    description: 'Tasks associated with the company.',
    type: [TaskResponseDto],
  })
  tasks: TaskResponseDto[];

  @ApiProperty({
    description: 'Deals associated with the company.',
    type: [DealResponseDto],
  })
  deals: DealResponseDto[];
}