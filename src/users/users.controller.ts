import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';

import { RolesGuard } from '../auth/roles.guard.js';
import { CreateUserDto, UserRole } from './dto/create-user.dto.js';
import type { AuthenticatedRequest } from '../auth/auth.guard.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserQueryDto } from './dto/user-query.dto.js';
import { UsersService } from './users.service.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { TaskResponseDto } from '../tasks/dto/task-response.dto.js';
import { DealResponseDto } from '../deals/dto/deal-response.dto.js';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get all users
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Returns a list of users with optional filtering by name, email, and role.',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter users by name.',
    example: 'Hanna',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Filter users by email address.',
    example: 'hanna@example.com',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: UserRole,
    description: 'Filter users by role.',
    example: UserRole.EMPLOYEE,
  })
  @ApiOkResponse({
    description: 'Users returned successfully.',
    type: [UserResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Query parameters are invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get()
  getAllUsers(@Query() query: UserQueryDto) {
    return this.usersService.getAllUsers(query);
  }

  // Get user by ID
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Returns a single user using their unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'User identifier.',
    example: 7,
  })
  @ApiOkResponse({
    description: 'User found successfully.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'User ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  // Get user deals
  @ApiOperation({
    summary: 'Get user deals',
    description:
      'Returns all deals assigned to the specified user. EMPLOYEE can only access their own deals.',
  })
  @ApiParam({
    name: 'id',
    description: 'User identifier.',
    example: 7,
  })
  @ApiOkResponse({
    description: 'User deals returned successfully.',
    type: [DealResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'User ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'You cannot access another user’s deals.',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get(':id/deals')
  getUserDeals(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.usersService.getUserDeals(
      id,
      request.user.sub,
      request.user.role,
    );
  }

  // Get user tasks
  @ApiOperation({
    summary: 'Get user tasks',
    description:
      'Returns all tasks assigned to the specified user. EMPLOYEE can only access their own tasks.',
  })
  @ApiParam({
    name: 'id',
    description: 'User identifier.',
    example: 7,
  })
  @ApiOkResponse({
    description: 'User tasks returned successfully.',
    type: [TaskResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'User ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'You cannot access another user’s tasks.',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get(':id/tasks')
  getUserTasks(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.usersService.getUserTasks(
      id,
      request.user.sub,
      request.user.role,
    );
  }

  // Create user
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Create user',
    description: 'Creates a new user. Only ADMIN users can create users.',
  })
  @ApiCreatedResponse({
    description: 'User created successfully.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Request data is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only ADMIN users can create users.',
  })
  @ApiConflictResponse({
    description: 'A user with this email address already exists.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  // Update user
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update user',
    description:
      'Updates an existing user. Only provided fields are changed. Only ADMIN users can update users.',
  })
  @ApiParam({
    name: 'id',
    description: 'User identifier.',
    example: 7,
  })
  @ApiOkResponse({
    description: 'User updated successfully.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'User ID or request data is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only ADMIN users can update users.',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiConflictResponse({
    description: 'A user with this email address already exists.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, dto);
  }

  // Delete user
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Deletes a user. Only ADMIN users can delete users.',
  })
  @ApiParam({
    name: 'id',
    description: 'User identifier.',
    example: 7,
  })
  @ApiNoContentResponse({
    description: 'User deleted successfully.',
  })
  @ApiBadRequestResponse({
    description: 'User ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only ADMIN users can delete users.',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
