import { IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from './create-user.dto.js';

export class UserQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}