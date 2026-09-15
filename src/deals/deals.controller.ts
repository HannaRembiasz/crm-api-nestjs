import { Controller, Get, Param, Post, Body, Patch, Delete } from '@nestjs/common';
import { CreateDealDto } from './dto/create-deal.dto.js';
import { UpdateDealDto } from './dto/update-deal.dto.js';
import { DealsService } from './deals.service.js';

@Controller('deals')
export class DealsController {
    constructor(private readonly dealsService: DealsService) {}

    @Get()
    getAllDeals() {
        return this.dealsService.getAllDeals();
    }

    @Get(':id')
    getDealById(@Param('id') id: number) {
        return this.dealsService.getDealById(id);
    }

    @Post()
    createDeal(@Body() dto: CreateDealDto) {
        return this.dealsService.createDeal(dto);
    }

    @Patch(':id')
    updateDeal(@Param('id') id: number, @Body() dto: UpdateDealDto) {
        return this.dealsService.updateDeal(id, dto);
    }

    @Delete(':id')
    deleteDeal(@Param('id') id: number) {
        return this.dealsService.deleteDeal(id);
    }
}

