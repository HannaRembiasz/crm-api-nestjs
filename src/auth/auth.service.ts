import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UserRole } from '../users/dto/create-user.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

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

  async login(dto: LoginDto) {
    const user = await this.prisma.client.orm.public.User.where({
      email: dto.email,
    }).first();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload);

    return { access_token: accessToken };
  }
}
