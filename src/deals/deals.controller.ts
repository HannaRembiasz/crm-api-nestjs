import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '../users/dto/create-user.dto.js';
import { CreateDealDto } from './dto/create-deal.dto.js';
import { UpdateDealDto } from './dto/update-deal.dto.js';
import { DealsService } from './deals.service.js';
import { DealQueryDto } from './dto/deal-query.dto.js';

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  getAllDeals(@Query() query: DealQueryDto) {
    return this.dealsService.getAllDeals(query);
  }

  @Get(':id')
  getDealById(@Param('id') id: number) {
    return this.dealsService.getDealById(id);
  }

  @Get(':id/company')
  getCompanyByDealId(@Param('id') id: number) {
    return this.dealsService.getDealCompany(id);
  }

  @Get(':id/user')
  getDealUser(@Param('id') id: number) {
    return this.dealsService.getDealUser(id);
  }

  @Post()
  createDeal(@Body() dto: CreateDealDto) {
    return this.dealsService.createDeal(dto);
  }

  @Patch(':id')
  updateDeal(@Param('id') id: number, @Body() dto: UpdateDealDto) {
    return this.dealsService.updateDeal(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDeal(@Param('id') id: number) {
    return this.dealsService.deleteDeal(id);
  }
}
