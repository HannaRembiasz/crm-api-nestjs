import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { CompaniesService } from './companies.service.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';

@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get()
  getAllCompanies() {
    return this.companiesService.getAllCompanies();
  }

  @Get(':id')
  getCompanyById(@Param('id') id: string) {
    return this.companiesService.getCompanyById(Number(id));
  }

  @Post()
  createCompany(@Body() dto: CreateCompanyDto) {
    return this.companiesService.createCompany(dto);
  }

  @Patch(':id')
  updateCompany(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.updateCompany(Number(id), dto);
  }

  @Delete(':id')
  deleteCompany(@Param('id') id: string) {
    return this.companiesService.deleteCompany(Number(id));
  }
}
