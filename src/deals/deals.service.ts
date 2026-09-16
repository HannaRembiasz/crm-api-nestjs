import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotFoundException } from '@nestjs/common';
import { CreateDealDto } from './dto/create-deal.dto.js';
import { UpdateDealDto } from './dto/update-deal.dto.js';
import { DealQueryDto } from './dto/deal-query.dto.js';

@Injectable()
export class DealsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllDeals(query: DealQueryDto) {
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

  async getDealById(id: number) {
    const deal = await this.prisma.client.orm.public.Deal.first({ id: id });

    if (!deal) {
      throw new NotFoundException(`Deal not found`);
    }

    return deal;
  }

  async getDealCompany(id: number) {
    const deal = await this.prisma.client.orm.public.Deal.where({ id: id })
      .include('company')
      .first();

    if (!deal) {
      throw new NotFoundException(`Deal not found`);
    }

    return deal;
  }

  async getDealUser(id: number) {
    const deal = await this.prisma.client.orm.public.Deal.where({ id: id })
      .include('assignedTo')
      .first();

    if (!deal) {
      throw new NotFoundException(`Deal not found`);
    }

    return deal;
  }

  async createDeal(dto: CreateDealDto) {
    return this.prisma.client.orm.public.Deal.create(dto);
  }

  async updateDeal(id: number, dto: UpdateDealDto) {
    const deal = await this.prisma.client.orm.public.Deal.where({
      id: id,
    }).update(dto);

    if (!deal) {
      throw new NotFoundException(`Deal not found`);
    }

    return deal;
  }

  async deleteDeal(id: number) {
    const deal = await this.prisma.client.orm.public.Deal.where({
      id: id,
    }).delete();

    if (!deal) {
      throw new NotFoundException(`Deal not found`);
    }
    
    return;
  }
}
