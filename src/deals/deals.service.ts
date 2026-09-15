import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDealDto } from './dto/create-deal.dto.js';
import { UpdateDealDto } from './dto/update-deal.dto.js';

@Injectable()
export class DealsService {
    constructor(private readonly prisma: PrismaService) {}

    getAllDeals() {
        return this.prisma.client.orm.public.Deal.all();
    }

    getDealById(id: number) {
        return this.prisma.client.orm.public.Deal.first({ id: id });
    }

    createDeal(dto: CreateDealDto) {
        return this.prisma.client.orm.public.Deal.create(dto);
    }

    updateDeal(id: number, dto: UpdateDealDto) {
        return this.prisma.client.orm.public.Deal.where({ id: id }).update(dto);
    }

    deleteDeal(id: number) {
        return this.prisma.client.orm.public.Deal.where({ id: id }).delete();
    }
}
