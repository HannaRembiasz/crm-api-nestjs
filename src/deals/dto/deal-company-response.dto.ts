import { ApiProperty } from '@nestjs/swagger';

import { DealResponseDto } from './deal-response.dto.js';
import { CompanyResponseDto } from '../../companies/dto/company-response.dto.js';

export class DealCompanyResponseDto extends DealResponseDto {
  @ApiProperty({
    type: CompanyResponseDto,
    nullable: true,
    description: 'Company associated with the deal.',
  })
  company: CompanyResponseDto | null;
}