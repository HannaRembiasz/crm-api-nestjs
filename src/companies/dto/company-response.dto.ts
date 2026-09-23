import { ApiProperty } from '@nestjs/swagger';

export class CompanyResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique company identifier.',
  })
  id: number;

  @ApiProperty({
    example: 'Company Ltd',
    description: 'Company name.',
  })
  name: string;

  @ApiProperty({
    example: 'contact@company.com',
    nullable: true,
    description: 'Company email address.',
  })
  email: string | null;

  @ApiProperty({
    example: '+48 123 456 789',
    nullable: true,
    description: 'Company phone number.',
  })
  phone: string | null;

  @ApiProperty({
    example: 'https://company.com',
    nullable: true,
    description: 'Company website.',
  })
  website: string | null;

  @ApiProperty({
    example: 'Main Street 1',
    nullable: true,
    description: 'Company street address.',
  })
  address: string | null;

  @ApiProperty({
    example: 'Warsaw',
    nullable: true,
    description: 'Company city.',
  })
  city: string | null;

  @ApiProperty({
    example: '00-001',
    nullable: true,
    description: 'Company postal code.',
  })
  postalCode: string | null;

  @ApiProperty({
    example: 'Poland',
    nullable: true,
    description: 'Company country.',
  })
  country: string | null;

  @ApiProperty({
    example: 'Important customer.',
    nullable: true,
    description: 'Additional notes about the company.',
  })
  notes: string | null;

  @ApiProperty({
    example: '2026-09-14 12:19:31.891653+00',
    description: 'Company creation timestamp.',
  })
  createdAt: string;

  @ApiProperty({
    example: '2026-09-14 12:19:31.724+00',
    description: 'Timestamp of the last company update.',
  })
  updatedAt: string;
}