import { Controller, Query, Get, Post, Body, Param, Patch, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CompaniesService } from './companies.service.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';
import { CompanyQueryDto } from './dto/company-query.dto.js';

@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get()
  getAllCompanies(@Query() query: CompanyQueryDto) {
    return this.companiesService.getAllCompanies(query);
  }

  @Get(':id')
  getCompanyById(@Param('id') id: string) {
    return this.companiesService.getCompanyById(Number(id));
  }

  @Get(':id/contacts')
  getCompanyContacts(@Param('id') id: string) {
    return this.companiesService.getCompanyContacts(Number(id));
  }

  @Get(':id/tasks')
  getCompanyTasks(@Param('id') id: string) {
    return this.companiesService.getCompanyTasks(Number(id));
  }

  @Get(':id/deals')
  getCompanyDeals(@Param('id') id: string) {
    return this.companiesService.getCompanyDeals(Number(id));
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
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCompany(@Param('id') id: string) {
    return this.companiesService.deleteCompany(Number(id));
  }
}
