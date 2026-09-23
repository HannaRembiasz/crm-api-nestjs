import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsInt,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({
    example: 'John',
    description: 'Contact first name.',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Smith',
    description: 'Contact last name.',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({
    example: 'john.smith@acme.com',
    description: 'Contact email address.',
  })
  @IsEmail()
  @IsOptional()
  @IsNotEmpty()
  email?: string;

  @ApiPropertyOptional({
    example: '+48 123 456 789',
    description: 'Contact phone number.',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  phone?: string;

  @ApiPropertyOptional({
    example: 'Sales Manager',
    description: 'Contact job title.',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  jobTitle?: string;

  @ApiPropertyOptional({
    example: 'Primary contact to the company.',
    description: 'Additional notes about the contact.',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  notes?: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the company associated with the contact.',
  })
  @IsInt()
  @IsNotEmpty()
  companyId: number;
}