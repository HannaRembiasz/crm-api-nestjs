import { IsString, IsNotEmpty, IsEmail, IsOptional, IsInt } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

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
  @IsNotEmpty()
  companyId: number;
}
