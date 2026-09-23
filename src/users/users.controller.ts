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
import { RolesGuard } from '../auth/roles.guard.js';
import { CreateUserDto, UserRole } from './dto/create-user.dto.js';
import type { AuthenticatedRequest } from '../auth/auth.guard.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserQueryDto } from './dto/user.query.dto.js';
import { UsersService } from './users.service.js';
import { Roles } from '../auth/roles.decorator.js';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllUsers(@Query() query: UserQueryDto) {
    return this.usersService.getAllUsers(query);
  }

  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  @Get(':id/deals')
  getUserDeals(@Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    return this.usersService.getUserDeals(id, request.user.sub, request.user.role);
  }

  @Get(':id/tasks')
  getUserTasks(@Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    return this.usersService.getUserTasks(id, request.user.sub, request.user.role);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Patch(':id')
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
