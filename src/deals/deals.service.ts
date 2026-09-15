import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DealsService {
    constructor(private readonly prisma: PrismaService) {}

    getAllDeals() {
        return this.prisma.client.orm.public.Deal.all();
    }
}
