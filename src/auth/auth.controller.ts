import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import type { Response, Request } from 'express';

import { Public } from './public.decorator.js';
import type { AuthenticatedRequest } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

import { UserResponseDto } from '../users/dto/user-response.dto.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Get current user
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user',
    description:
      'Returns the currently authenticated user based on the user ID stored in the access token.',
  })
  @ApiOkResponse({
    description: 'Current user returned successfully.',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiNotFoundResponse({
    description: 'Authenticated user was not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get('me')
  getMe(@Req() request: AuthenticatedRequest) {
    return this.authService.getMe(request.user.sub);
  }

  // Register
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Register user',
    description:
      'Creates a new user account. Newly registered users are assigned the EMPLOYEE role automatically. Limited to 5 requests per minute.',
  })
  @ApiCreatedResponse({
    description: 'User registered successfully.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Registration data is invalid.',
  })
  @ApiConflictResponse({
    description: 'A user with this email address already exists.',
  })
  @ApiTooManyRequestsResponse({
    description: 'Registration rate limit exceeded.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // Login
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Login',
    description:
      'Authenticates a user and returns a JWT access token. A refresh token is stored in an HttpOnly cookie. Limited to 5 requests per minute.',
  })
  @ApiBody({
  description: 'Login with one of the demo accounts below.',
  examples: {
    employee: {
      summary: 'Employee',
      value: {
        email: 'employee@mail.com',
        password: 'employee.password',
      },
    },
    manager: {
      summary: 'Manager',
      value: {
        email: 'manager@mail.com',
        password: 'manager.password',
      },
    },
    admin: {
      summary: 'Admin',
      value: {
        email: 'admin@mail.com',
        password: 'admin.password',
      },
    },
  },
})
  @ApiCreatedResponse({
    description:
      'Login successful. The access token is returned and the refresh token is stored in an HttpOnly cookie.',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          description:
            'JWT access token used to authenticate protected API requests.',
        },
      },
      required: ['access_token'],
    },
  })
  @ApiBadRequestResponse({
    description: 'Login data is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials.',
  })
  @ApiTooManyRequestsResponse({
    description: 'Login rate limit exceeded.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { access_token, refresh_token } =
      await this.authService.login(dto);

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { access_token };
  }

  // Refresh access token
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Uses the refresh token stored in the HttpOnly cookie to issue a new JWT access token and rotate the refresh token. Limited to 10 requests per minute.',
  })
  @ApiCreatedResponse({
    description:
      'Access token refreshed successfully. The refresh token cookie is rotated.',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          description:
            'New JWT access token used to authenticate protected API requests.',
        },
      },
      required: ['access_token'],
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Refresh token is missing, invalid, expired, revoked, or already used.',
  })
  @ApiTooManyRequestsResponse({
    description: 'Refresh rate limit exceeded.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const { access_token, refresh_token, expires_at } =
      await this.authService.refresh(refreshToken);

    const maxAge = Math.max(
      new Date(expires_at).getTime() - Date.now(),
      0,
    );

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge,
    });

    return { access_token };
  }

  // Logout
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout',
    description:
      'Revokes the current authentication session and clears the refresh token cookie.',
  })
  @ApiCreatedResponse({
    description: 'Logout successful.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Logged out successfully',
        },
      },
      required: ['message'],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Post('logout')
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(request.user.sid);

    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }
}