import { Controller, Get, Param } from '@nestjs/common';
import { DealsService } from './deals.service.js';

@Controller('deals')
export class DealsController {
    constructor(private readonly dealsService: DealsService) {}

    @Get()
    getAllDeals() {
        return this.dealsService.getAllDeals();
    }
}

