import {
  IsString,
  IsOptional,
} from 'class-validator';

export class ContactQueryDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  email?: string;
}