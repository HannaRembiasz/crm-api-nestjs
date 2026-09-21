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
import { DealStatus } from './dto/create-deal.dto.js';

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

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    const sortOrder = query.sortOrder ?? 'asc';

    switch (query.sortBy ?? 'createdAt') {
      case 'title':
        deals = deals.orderBy((deal) =>
          sortOrder === 'asc' ? deal.title.asc() : deal.title.desc(),
        );
        break;

      case 'status':
        deals = deals.orderBy((deal) =>
          sortOrder === 'asc' ? deal.status.asc() : deal.status.desc(),
        );
        break;

      case 'value':
        deals = deals.orderBy((deal) =>
          sortOrder === 'asc' ? deal.value.asc() : deal.value.desc(),
        );
        break;

      case 'createdAt':
        deals = deals.orderBy((deal) =>
          sortOrder === 'asc' ? deal.createdAt.asc() : deal.createdAt.desc(),
        );
        break;
    }

    return deals.limit(limit).offset(offset).all();
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

    const company = await this.prisma.client.orm.public.Company.first({
      id: dto.companyId,
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const user = await this.prisma.client.orm.public.User.first({
      id: assignedToId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
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

    if (userRole === UserRole.EMPLOYEE && dto.assignedToId !== undefined) {
      throw new ForbiddenException('Employees cannot reassign deals');
    }

    if (
      userRole === UserRole.EMPLOYEE &&
      (deal.status === DealStatus.WON || deal.status === DealStatus.LOST) &&
      dto.status !== undefined &&
      dto.status !== deal.status
    ) {
      throw new ForbiddenException('Employees cannot reopen a closed deal');
    }

    if (dto.assignedToId !== undefined) {
      const user = await this.prisma.client.orm.public.User.first({
        id: dto.assignedToId,
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
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
