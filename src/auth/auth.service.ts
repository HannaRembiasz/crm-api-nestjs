import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto.js';
import { UserRole } from '../users/dto/create-user.dto.js';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prisma.client.orm.public.User.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.EMPLOYEE,
    });

    const { password, ...safeUser } = newUser;

    return safeUser;
  }
}
