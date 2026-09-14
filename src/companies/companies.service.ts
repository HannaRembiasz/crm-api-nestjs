import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  getAllCompanies() {
    return this.prisma.client.orm.public.Company.all();
  }

  createCompany(dto: CreateCompanyDto) {
    return this.prisma.client.orm.public.Company.create(dto);
  }

  getCompanyById(id: number) {
    return this.prisma.client.orm.public.Company.first({ id: id });
  }

  updateCompany(id: number, dto: UpdateCompanyDto) {
    return this.prisma.client.orm.public.Company.where({ id: id }).update(dto);
  }

  deleteCompany(id: number) {
    return this.prisma.client.orm.public.Company.where({ id: id }).delete();
  }
}
