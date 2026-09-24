import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiPropertyOptional({
    example: 'Hanna',
    description: 'User name.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    example: 'hanna@example.com',
    description: 'User email address.',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'User password. Must be between 12 and 64 characters.',
    minLength: 12,
    maxLength: 64,
    writeOnly: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(64)
  password: string;
}
