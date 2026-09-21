import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '../users/dto/create-user.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';
import { CompanyQueryDto } from './dto/company-query.dto.js';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async getAllCompanies(query: CompanyQueryDto) {
    let companies = this.prisma.client.orm.public.Company;

    if (query.name) {
      companies = companies.where((company) =>
        company.name.ilike(`%${query.name}%`),
      );
    }

    if (query.city) {
      companies = companies.where((company) =>
        company.city.ilike(`%${query.city}%`),
      );
    }

    if (query.country) {
      companies = companies.where((company) =>
        company.country.ilike(`%${query.country}%`),
      );
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    const sortOrder = query.sortOrder ?? 'asc';

    switch (query.sortBy ?? 'name') {
      case 'name':
        companies = companies.orderBy((company) =>
          sortOrder === 'asc' ? company.name.asc() : company.name.desc(),
        );
        break;

      case 'city':
        companies = companies.orderBy((company) =>
          sortOrder === 'asc' ? company.city.asc() : company.city.desc(),
        );
        break;

      case 'country':
        companies = companies.orderBy((company) =>
          sortOrder === 'asc' ? company.country.asc() : company.country.desc(),
        );
        break;

      case 'createdAt':
        companies = companies.orderBy((company) =>
          sortOrder === 'asc'
            ? company.createdAt.asc()
            : company.createdAt.desc(),
        );
        break;
    }

    return companies.limit(limit).offset(offset).all();
  }

  async createCompany(dto: CreateCompanyDto) {
    return this.prisma.client.orm.public.Company.create(dto);
  }

  async getCompanyById(id: number) {
    const company = await this.prisma.client.orm.public.Company.first({
      id: id,
    });

    if (!company) {
      throw new NotFoundException(`Company not found`);
    }

    return company;
  }

  async getCompanyContacts(id: number) {
    const company = await this.prisma.client.orm.public.Company.where({
      id: id,
    })
      .include('contacts')
      .first();

    if (!company) {
      throw new NotFoundException(`Company not found`);
    }

    return company;
  }

  async getCompanyTasks(id: number, userId: number, userRole: UserRole) {
    const company = await this.prisma.client.orm.public.Company.where({
      id: id,
    }).first();

    if (!company) {
      throw new NotFoundException(`Company not found`);
    }

    let tasks = this.prisma.client.orm.public.Task.where({ companyId: id });

    if (userRole === UserRole.EMPLOYEE) {
      tasks = tasks.where({ assignedToId: userId });
    }

    return tasks.all();
  }

  async getCompanyDeals(id: number, userId: number, userRole: UserRole) {
    const company = await this.prisma.client.orm.public.Company.where({
      id: id,
    }).first();

    if (!company) {
      throw new NotFoundException(`Company not found`);
    }

    let deals = this.prisma.client.orm.public.Deal.where({ companyId: id });

    if (userRole === UserRole.EMPLOYEE) {
      deals = deals.where({ assignedToId: userId });
    }

    return deals.all();
  }

  async updateCompany(id: number, dto: UpdateCompanyDto) {
    const company = await this.prisma.client.orm.public.Company.where({
      id: id,
    }).update(dto);

    if (!company) {
      throw new NotFoundException(`Company not found`);
    }

    return company;
  }

  async deleteCompany(id: number) {
    const company = await this.prisma.client.orm.public.Company.where({
      id: id,
    }).delete();

    if (!company) {
      throw new NotFoundException(`Company not found`);
    }

    return;
  }
}
