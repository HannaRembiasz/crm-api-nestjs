import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';
import { CompanyQueryDto } from './dto/company-query.dto.js';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  getAllCompanies(query: CompanyQueryDto) {
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

  createCompany(dto: CreateCompanyDto) {
    return this.prisma.client.orm.public.Company.create(dto);
  }

  getCompanyById(id: number) {
    return this.prisma.client.orm.public.Company.first({ id: id });
  }

  getCompanyContacts(id: number) {
    return this.prisma.client.orm.public.Company.where({ id: id }).include('contacts').first();
  }

  getCompanyTasks(id: number) {
    return this.prisma.client.orm.public.Company.where({ id: id }).include('tasks').first();
  }

  updateCompany(id: number, dto: UpdateCompanyDto) {
    return this.prisma.client.orm.public.Company.where({ id: id }).update(dto);
  }

  deleteCompany(id: number) {
    return this.prisma.client.orm.public.Company.where({ id: id }).delete();
  }
}
