import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { vi } from 'vitest';

import { AuthGuard } from './auth.guard.js';
import { UserRole } from '../users/dto/create-user.dto.js';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: {
    verifyAsync: ReturnType<typeof vi.fn>;
  };
  let reflector: {
    getAllAndOverride: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    jwtService = {
      verifyAsync: vi.fn(),
    };

    reflector = {
      getAllAndOverride: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: Reflector,
          useValue: reflector,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);

    vi.clearAllMocks();
  });

  const createContext = (
    authorization?: string,
  ) => {
    const request = {
      headers: {
        authorization,
      },
    };

    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(request),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow a public route', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    const context = createContext();

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should reject a request without an access token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    const context = createContext();

    await expect(
      guard.canActivate(context),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should reject a malformed authorization header', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    const context = createContext('Basic abc123');

    await expect(
      guard.canActivate(context),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should reject an invalid JWT', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    jwtService.verifyAsync.mockRejectedValue(
      new Error('Invalid token'),
    );

    const context = createContext('Bearer invalid-token');

    await expect(
      guard.canActivate(context),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith(
      'invalid-token',
    );
  });

  it('should allow a valid JWT and attach the payload to the request', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    const payload = {
      sub: 20,
      sid: 5,
      email: 'employee@example.com',
      role: UserRole.EMPLOYEE,
      iat: 100,
      exp: 200,
    };

    jwtService.verifyAsync.mockResolvedValue(payload);

    const context = createContext('Bearer valid-token');

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith(
      'valid-token',
    );

    const request = context
      .switchToHttp()
      .getRequest();

    expect(request.user).toEqual(payload);
  });
});