import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto, UserRole } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserQueryDto } from './dto/user-query.dto.js';

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

    return users
      .select('id', 'email', 'name', 'role', 'createdAt', 'updatedAt')
      .all();
  }

  async getUserById(id: number) {
    const user = await this.prisma.client.orm.public.User.where({
      id: id,
    })
      .select('id', 'email', 'name', 'role', 'createdAt', 'updatedAt')
      .first();

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  async getUserDeals(id: number, userId: number, userRole: UserRole) {
    const user = await this.prisma.client.orm.public.User.where({
      id: id,
    }).first();

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (userRole === UserRole.EMPLOYEE && id !== userId) {
      throw new ForbiddenException(`You cannot access another user\'s deals`);
    }

    const deals = this.prisma.client.orm.public.Deal.where({
      assignedToId: id,
    }).all();

    return deals;
  }

  async getUserTasks(id: number, userId: number, userRole: UserRole) {
    const user = await this.prisma.client.orm.public.User.where({
      id: id,
    }).first();

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (userRole === UserRole.EMPLOYEE && id !== userId) {
      throw new ForbiddenException(`You cannot access another user\'s tasks`);
    }

    const tasks = this.prisma.client.orm.public.Task.where({
      assignedToId: id,
    });

    return tasks.all();
  }

  async createUser(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prisma.client.orm.public.User.create({
      ...dto,
      password: hashedPassword,
    });

    const { password, ...safeUser } = newUser;

    return safeUser;
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.client.orm.public.User.where({
      id: id,
    }).update(dto);

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const { password, ...safeUser } = user;

    return safeUser;
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
