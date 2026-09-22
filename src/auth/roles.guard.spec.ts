import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { vi } from 'vitest';

import { RolesGuard } from './roles.guard.js';
import { UserRole } from '../users/dto/create-user.dto.js';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: {
    getAllAndOverride: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    reflector = {
      getAllAndOverride: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: reflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);

    vi.clearAllMocks();
  });

  const createContext = (role: UserRole) => {
    const request = {
      user: {
        sub: 1,
        sid: 1,
        email: 'test@example.com',
        role,
        iat: 100,
        exp: 200,
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

  it('should allow access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const context = createContext(UserRole.EMPLOYEE);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow a user with the required role', () => {
    reflector.getAllAndOverride.mockReturnValue([
      UserRole.MANAGER,
    ]);

    const context = createContext(UserRole.MANAGER);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should reject a user without the required role', () => {
    reflector.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN,
    ]);

    const context = createContext(UserRole.EMPLOYEE);

    expect(() => guard.canActivate(context)).toThrow(
      ForbiddenException,
    );
  });

  it('should allow a user matching one of multiple required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN,
      UserRole.MANAGER,
    ]);

    const context = createContext(UserRole.MANAGER);

    expect(guard.canActivate(context)).toBe(true);
  });
});