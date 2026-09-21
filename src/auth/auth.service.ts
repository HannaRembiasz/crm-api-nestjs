import { Injectable, Logger, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'node:crypto';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UserRole } from '../users/dto/create-user.dto.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async getMe(userId: number) {
    const user = await this.prisma.client.orm.public.User.where({
      id: userId,
    })
      .select('id', 'email', 'name', 'role', 'createdAt', 'updatedAt')
      .first();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

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

    const session = await this.prisma.client.transaction(async (tx) => {
      const session = await tx.orm.public.AuthSession.create({
        userId: user.id,
        expiresAt: sessionExpiresAt,
      });

      await tx.orm.public.RefreshToken.create({
        sessionId: session.id,
        tokenHash: refreshTokenHash,
        expiresAt: sessionExpiresAt,
      });

      return session;
    });

    //access token
    const payload = {
      sub: user.id,
      sid: session.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refresh(refreshToken: string) {
    const refreshTokenHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const now = new Date();
    const GENERIC_MSG = 'Invalid refresh token';

    const result = await this.prisma.client.transaction(async (tx) => {
      const token = await tx.orm.public.RefreshToken.where({
        tokenHash: refreshTokenHash,
      })
        .include('session', (session) => session.include('user'))
        .first();

      if (!token) {
        this.logger.warn('Refresh failed: token not found');
        throw new UnauthorizedException(GENERIC_MSG);
      }

      if (token.usedAt) {
        await this.prisma.client.orm.public.AuthSession.where({
          id: token.session.id,
        }).update({
          revokedAt: now.toISOString(),
        });
        this.logger.warn(
          `Refresh failed: reuse detected, session ${token.session.id} revoked`,
        );
        throw new UnauthorizedException(GENERIC_MSG);
      }

      if (token.session.revokedAt) {
        this.logger.warn(`Refresh failed: session ${token.session.id} revoked`);
        throw new UnauthorizedException(GENERIC_MSG);
      }

      if (new Date(token.expiresAt) <= now) {
        this.logger.warn(`Refresh failed: token ${token.id} expired`);
        throw new UnauthorizedException(GENERIC_MSG);
      }

      if (new Date(token.session.expiresAt) <= now) {
        this.logger.warn(`Refresh failed: session ${token.session.id} expired`);
        throw new UnauthorizedException(GENERIC_MSG);
      }

      const newRefreshToken = randomBytes(64).toString('hex');

      const newRefreshTokenHash = createHash('sha256')
        .update(newRefreshToken)
        .digest('hex');

      const updated = await tx.orm.public.RefreshToken.where({
        id: token.id,
        usedAt: null,
      }).update({
        usedAt: now.toISOString(),
      });

      if (!updated) {
        this.logger.warn(
          `Refresh failed: failed to mark token ${token.id} as used`,
        );
        throw new UnauthorizedException(GENERIC_MSG);
      }

      await tx.orm.public.RefreshToken.create({
        sessionId: token.session.id,
        tokenHash: newRefreshTokenHash,
        expiresAt: token.session.expiresAt,
      });

      const payload = {
        sub: token.session.user.id,
        sid: token.session.id,
        email: token.session.user.email,
        role: token.session.user.role,
      };

      const accessToken = await this.jwtService.signAsync(payload);

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
        expires_at: token.session.expiresAt,
      };
    });

    return result;
  }

  async logout(sessionId: number) {
    await this.prisma.client.orm.public.AuthSession.where({
      id: sessionId,
    }).update({
      revokedAt: new Date().toISOString(),
    });
  }
}
