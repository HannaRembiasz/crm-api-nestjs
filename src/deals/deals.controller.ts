import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.guard.js';
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
  getAllDeals(@Query() query: DealQueryDto, @Req() request: AuthenticatedRequest) {
    return this.dealsService.getAllDeals(query, request.user.sub, request.user.role);
  }

  @Get(':id')
  getDealById(@Param('id') id: number, @Req() request: AuthenticatedRequest) {
    return this.dealsService.getDealById(id, request.user.sub, request.user.role);
  }

  @Get(':id/company')
  getCompanyByDealId(@Param('id') id: number, @Req() request: AuthenticatedRequest) {
    return this.dealsService.getDealCompany(id, request.user.sub, request.user.role);
  }

  @Get(':id/user')
  getDealUser(@Param('id') id: number, @Req() request: AuthenticatedRequest) {
    return this.dealsService.getDealUser(id, request.user.sub, request.user.role);
  }

  @Post()
  createDeal(@Body() dto: CreateDealDto, @Req() request: AuthenticatedRequest) {
    return this.dealsService.createDeal(dto, request.user.sub, request.user.role);
  }

  @Patch(':id')
  updateDeal(@Param('id') id: number, @Body() dto: UpdateDealDto, @Req() request: AuthenticatedRequest) {
    return this.dealsService.updateDeal(id, request.user.sub, request.user.role, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDeal(@Param('id') id: number) {
    return this.dealsService.deleteDeal(id);
  }
}
