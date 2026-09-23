import { IsString, IsOptional, IsEnum } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserRole } from './create-user.dto.js';

export class UserQueryDto {
  @ApiPropertyOptional({
    example: 'Hanna',
    description: 'Filter users by name.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'hanna@example.com',
    description: 'Filter users by email address.',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.EMPLOYEE,
    description: 'Filter users by role.',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}