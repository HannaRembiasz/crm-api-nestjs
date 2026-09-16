import { IsString, IsNotEmpty, IsEmail, IsOptional, IsInt } from 'class-validator';

export class UpdateContactDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  firstName?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  @IsNotEmpty()
  email?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  phone?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  jobTitle?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  notes?: string;

  @IsInt()
  @IsOptional()
  @IsNotEmpty()
  companyId?: number;
}
