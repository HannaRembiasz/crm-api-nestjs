import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDealDto } from './dto/create-deal.dto.js';
import { UpdateDealDto } from './dto/update-deal.dto.js';
import { DealQueryDto } from './dto/deal-query.dto.js';

@Injectable()
export class DealsService {
    constructor(private readonly prisma: PrismaService) {}

    getAllDeals(query: DealQueryDto) {
        let deals = this.prisma.client.orm.public.Deal;

        if (query.title) {
            deals = deals.where((deal) => deal.title.ilike(`%${query.title}%`));
        }
        if (query.status) {
            deals = deals.where({ status: query.status });
        }
        if (query.companyId) {
            deals = deals.where({ companyId: query.companyId });
        }
        if (query.assignedToId) {
            deals = deals.where({ assignedToId: query.assignedToId });
        }
        return deals.all();
    }

    getDealById(id: number) {
        return this.prisma.client.orm.public.Deal.first({ id: id });
    }

    getDealCompany(id: number) {
        return this.prisma.client.orm.public.Deal.where({ id: id }).include('company').first();
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
