import { ApiProperty } from '@nestjs/swagger';

export class ContactResponseDto {
  @ApiProperty({
    example: 10,
    description: 'Unique contact identifier.',
  })
  id: number;

  @ApiProperty({
    example: 'John',
    description: 'Contact first name.',
  })
  firstName: string;

  @ApiProperty({
    example: 'Smith',
    description: 'Contact last name.',
  })
  lastName: string;

  @ApiProperty({
    example: 'john.smith@acme.com',
    nullable: true,
    description: 'Contact email address.',
  })
  email: string | null;

  @ApiProperty({
    example: '+48 123 456 789',
    nullable: true,
    description: 'Contact phone number.',
  })
  phone: string | null;

  @ApiProperty({
    example: 'Sales Manager',
    nullable: true,
    description: 'Contact job title.',
  })
  jobTitle: string | null;

  @ApiProperty({
    example: 'Primary contact to the company.',
    nullable: true,
    description: 'Additional notes about the contact.',
  })
  notes: string | null;

  @ApiProperty({
    example: 1,
    description: 'ID of the company associated with the contact.',
  })
  companyId: number;

  @ApiProperty({
    example: '2026-09-14 12:19:31.891653+00',
    description: 'Contact creation timestamp.',
  })
  createdAt: string;

  @ApiProperty({
    example: '2026-09-14 12:19:31.724+00',
    description: 'Timestamp of the last contact update.',
  })
  updatedAt: string;
}