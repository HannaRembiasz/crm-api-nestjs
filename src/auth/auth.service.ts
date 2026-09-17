import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'node:crypto';
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

    //refresh token
    const refreshToken = randomBytes(64).toString('hex');

    const refreshTokenHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const sessionExpiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString(); //30days

    await this.prisma.client.transaction(async (tx) => {
      const session = await tx.orm.public.AuthSession.create({
        userId: user.id,
        expiresAt: sessionExpiresAt,
      });

      await tx.orm.public.RefreshToken.create({
        sessionId: session.id,
        tokenHash: refreshTokenHash,
        expiresAt: sessionExpiresAt,
      });
    });

    //access token
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload);

    return { access_token: accessToken, refresh_token: refreshToken };
  }
}
