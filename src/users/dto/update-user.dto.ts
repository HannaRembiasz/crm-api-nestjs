import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserRole } from './create-user.dto.js';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'New User',
    description: 'User name.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    example: 'newuser@example.com',
    description: 'User email address.',
  })
  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.MANAGER,
    description: 'User role.',
  })
  @IsOptional()
  @IsEnum(UserRole)
  @IsNotEmpty()
  role?: UserRole;
}
