import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserQueryDto } from './dto/user.query.dto.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(query: UserQueryDto) {
    let users = this.prisma.client.orm.public.User;

    if (query.name) {
      users = users.where((user) => user.name.ilike(`%${query.name}%`));
    }

    if (query.email) {
      users = users.where((user) => user.email.ilike(`%${query.email}%`));
    }

    if (query.role) {
      users = users.where({ role: query.role });
    }

    return users.all();
  }

  async getUserById(id: number) {
    const user = await this.prisma.client.orm.public.User.where({
      id: id,
    }).first();

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  async getUserDeals(id: number) {
    const user = await this.prisma.client.orm.public.User.where({ id: id })
      .include('deals')
      .first();

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  async getUserTasks(id: number) {
    const user = await this.prisma.client.orm.public.User.where({ id: id })
      .include('tasks')
      .first();

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  async createUser(dto: CreateUserDto) {
    return this.prisma.client.orm.public.User.create(dto);
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.client.orm.public.User.where({
      id: id,
    }).update(dto);

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  async deleteUser(id: number) {
    const user = await this.prisma.client.orm.public.User.where({
      id: id,
    }).delete();

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return;
  }
}
