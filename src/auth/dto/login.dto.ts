import {
  IsString,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'hanna@example.com',
    description: 'User email address.',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'User password.',
    writeOnly: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}