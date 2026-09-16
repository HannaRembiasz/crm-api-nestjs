import { IsString, IsNotEmpty, IsEmail, IsOptional, IsUrl } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  @IsNotEmpty()
  email?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  phone?: string;

  @IsUrl()
  @IsOptional()
  @IsNotEmpty()
  website?: string;
  
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  address?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  city?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  postalCode?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  country?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  notes?: string;
}