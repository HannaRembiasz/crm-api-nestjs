import {
  IsString,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'employee@mail.com',
    description: 'User email address.',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'employee.password',
    description: 'User password.',
    writeOnly: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}