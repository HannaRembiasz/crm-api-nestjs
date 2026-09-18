import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateDealDto } from './dto/create-deal.dto.js';
import { UpdateDealDto } from './dto/update-deal.dto.js';
import { DealQueryDto } from './dto/deal-query.dto.js';
import { UserRole } from '../users/dto/create-user.dto.js';

@Injectable()
export class DealsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllDeals(query: DealQueryDto, userId: number, userRole: UserRole) {
    let deals = this.prisma.client.orm.public.Deal;

    if (userRole === UserRole.EMPLOYEE) {
      deals = deals.where({ assignedToId: userId });
    } else if (query.assignedToId) {
      deals = deals.where({ assignedToId: query.assignedToId });
    }

    if (query.title) {
      deals = deals.where((deal) => deal.title.ilike(`%${query.title}%`));
    }
    if (query.status) {
      deals = deals.where({ status: query.status });
    }
    if (query.companyId) {
      deals = deals.where({ companyId: query.companyId });
    }

    return deals.all();
  }

  async getDealById(id: number, userId: number, userRole: UserRole) {
    const deal = await this.prisma.client.orm.public.Deal.first({ id: id });

    if (!deal) {
      throw new NotFoundException(`Deal not found`);
    }

    if (userRole === UserRole.EMPLOYEE && deal.assignedToId !== userId) {
      throw new ForbiddenException(`You cannot access this deal`);
    }

    return deal;
  }

  async getDealCompany(id: number, userId: number, userRole: UserRole) {
    const deal = await this.prisma.client.orm.public.Deal.where({ id: id })
      .include('company')
      .first();

    if (!deal) {
      throw new NotFoundException(`Deal not found`);
    }

    if (userRole === UserRole.EMPLOYEE && deal.assignedToId !== userId) {
      throw new ForbiddenException(`You cannot access this deal`);
    }

    return deal;
  }

  async getDealUser(id: number, userId: number, userRole: UserRole) {
    const deal = await this.prisma.client.orm.public.Deal.where({ id: id })
      .include('assignedTo')
      .first();

    if (!deal) {
      throw new NotFoundException(`Deal not found`);
    }

    if (userRole === UserRole.EMPLOYEE && deal.assignedToId !== userId) {
      throw new ForbiddenException(`You cannot access this deal`);
    }

    return deal;
  }

  async createDeal(dto: CreateDealDto, userId: number, userRole: UserRole) {
    let assignedToId: number;

    if (userRole === UserRole.EMPLOYEE) {
      assignedToId = userId;
    } else {
      if (dto.assignedToId === undefined) {
        throw new BadRequestException('assignedToId is required');
      }
      assignedToId = dto.assignedToId;
    }

    return this.prisma.client.orm.public.Deal.create({
      ...dto,
      assignedToId,
    });
  }

  async updateDeal(
    id: number,
    userId: number,
    userRole: UserRole,
    dto: UpdateDealDto,
  ) {
    const deal = await this.prisma.client.orm.public.Deal.where({
      id: id,
    }).first();

    if (!deal) {
      throw new NotFoundException(`Deal not found`);
    }

    if (userRole === UserRole.EMPLOYEE && deal.assignedToId !== userId) {
      throw new ForbiddenException(`You cannot access this deal`);
    }

    const updatedDeal = await this.prisma.client.orm.public.Deal.where({
      id: id,
    }).update(dto);

    return updatedDeal;
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
