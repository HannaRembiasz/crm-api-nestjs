import {
  IsString,
  IsOptional,
} from 'class-validator';

export class CompanyQueryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;
}