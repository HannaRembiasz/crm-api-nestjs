import { IsString, IsOptional, IsEnum } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserRole } from './create-user.dto.js';

export class UserQueryDto {
  @ApiPropertyOptional({
      description: 'Filter users by name.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
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