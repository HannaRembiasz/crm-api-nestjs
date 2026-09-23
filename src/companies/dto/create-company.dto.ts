import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsUrl,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({
    example: 'Company Ltd',
    description: 'Company name.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'contact@company.com',
    description: 'Company email address.',
  })
  @IsEmail()
  @IsOptional()
  @IsNotEmpty()
  email?: string;

  @ApiPropertyOptional({
    example: '+48 123 456 789',
    description: 'Company phone number.',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://company.com',
    description: 'Company website.',
  })
  @IsUrl()
  @IsOptional()
  @IsNotEmpty()
  website?: string;

  @ApiPropertyOptional({
    example: 'Main Street 1',
    description: 'Company street address.',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  address?: string;

  @ApiPropertyOptional({
    example: 'Warsaw',
    description: 'Company city.',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  city?: string;

  @ApiPropertyOptional({
    example: '00-001',
    description: 'Company postal code.',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  postalCode?: string;

  @ApiPropertyOptional({
    example: 'Poland',
    description: 'Company country.',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  country?: string;

  @ApiPropertyOptional({
    example: 'Important customer.',
    description: 'Additional notes about the company.',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  notes?: string;
}
