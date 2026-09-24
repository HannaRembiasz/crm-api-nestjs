import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { UserRole } from '../users/dto/create-user.dto.js';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    sid: number;
    email: string;
    role: UserRole;
    iat: number;
    exp: number;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      const session = await this.prisma.client.orm.public.AuthSession.where({
        id: payload.sid,
      }).first();

      if (!session) {
        throw new UnauthorizedException();
      }

      if (session.revokedAt) {
        throw new UnauthorizedException();
      }

      if (new Date(session.expiresAt) <= new Date()) {
        throw new UnauthorizedException();
      }

      request['user'] = payload;

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
