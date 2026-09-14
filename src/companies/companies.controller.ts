import { Controller, Get } from '@nestjs/common';
import { CompaniesService } from './companies.service.js';

@Controller('companies')
export class CompaniesController {

    constructor(private companiesService: CompaniesService) {}

    @Get()
    getAllCompanies() {
        return this.companiesService.getAllCompanies();
    }
}
