import { ApiProperty } from '@nestjs/swagger';

import { ContactResponseDto } from './contact-response.dto.js';
import { CompanyResponseDto } from '../../companies/dto/company-response.dto.js';

export class ContactCompanyResponseDto extends ContactResponseDto {
  @ApiProperty({
    description: 'Company associated with the contact.',
    type: CompanyResponseDto,
  })
  company: CompanyResponseDto;
}