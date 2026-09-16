import { Injectable, NotFoundException } from '@nestjs/common';
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

    return companies.all();
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

  async getCompanyTasks(id: number) {
    const company = await this.prisma.client.orm.public.Company.where({
      id: id,
    })
      .include('tasks')
      .first();

    if (!company) {
      throw new NotFoundException(`Company not found`);
    }

    return company;
  }

  async getCompanyDeals(id: number) {
    const company = await this.prisma.client.orm.public.Company.where({
      id: id,
    })
      .include('deals')
      .first();

    if (!company) {
      throw new NotFoundException(`Company not found`);
    }

    return company;
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
