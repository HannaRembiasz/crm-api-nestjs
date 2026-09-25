import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class InternalMaintainGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.MAINTAIN_DB_SECRET;
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.header('x-maintain-secret');

    if (!expected) {
      throw new UnauthorizedException('MAINTAIN_DB_SECRET is not configured');
    }

    if (!provided || provided !== expected) {
      throw new UnauthorizedException('Invalid x-maintain-secret');
    }

    return true;
  }
}