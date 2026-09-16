import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    getAllUsers() {
        return this.prisma.client.orm.public.User.all();
    }
}
