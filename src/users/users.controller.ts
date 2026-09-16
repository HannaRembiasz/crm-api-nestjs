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
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserQueryDto } from './dto/user.query.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllUsers(@Query() query: UserQueryDto) {
    return this.usersService.getAllUsers(query);
  }

  @Get(':id')
  getUserById(@Param('id') id: number) {
    return this.usersService.getUserById(id);
  }

  @Get(':id/deals')
  getUserDeals(@Param('id') id: number) {
    return this.usersService.getUserDeals(id);
  }

  @Get(':id/tasks')
  getUserTasks(@Param('id') id: number) {
    return this.usersService.getUserTasks(id);
  }

  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Patch(':id')
  updateUser(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id') id: number) {
    return this.usersService.deleteUser(id);
  }
}
