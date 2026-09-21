import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard.js';
import { StatsService } from './stats.service.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '../users/dto/create-user.dto.js';
import { StatsQueryDto } from './dto/stats-query.dto.js';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @Get('/overview')
  getStats(@Query() query: StatsQueryDto) {
    return this.statsService.getStats(query);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @Get('/deals')
  getStatsDeals(@Query() query: StatsQueryDto) {
    return this.statsService.getStatsDeals(query);
  }
}
