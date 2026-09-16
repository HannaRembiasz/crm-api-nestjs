import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from './create-user.dto.js';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsEmail()
    @IsNotEmpty()
    email?: string;

    @IsOptional()
    @IsEnum(UserRole)
    @IsNotEmpty()
    role?: UserRole;
}