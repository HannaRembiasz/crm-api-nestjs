import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum } from 'class-validator';

export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    EMPLOYEE = 'EMPLOYEE',
}

export class CreateUserDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
}