import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from './create-user.dto.js';

export class UserResponseDto {
  @ApiProperty({
    example: 7,
    description: 'Unique user identifier.',
  })
  id: number;

  @ApiProperty({
    example: 'hanna@example.com',
    description: 'User email address.',
  })
  email: string;

  @ApiProperty({
    example: 'Hanna',
    description: 'User name.',
  })
  name: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.EMPLOYEE,
    description: 'User role.',
  })
  role: UserRole;

  @ApiProperty({
    example: '2026-09-14 12:19:31.891653+00',
    description: 'User creation timestamp.',
  })
  createdAt: string;

  @ApiProperty({
    example: '2026-09-14 12:19:31.724+00',
    description: 'Timestamp of the last user update.',
  })
  updatedAt: string;
}