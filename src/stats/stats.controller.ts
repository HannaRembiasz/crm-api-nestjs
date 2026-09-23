import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '../users/dto/create-user.dto.js';

import { StatsService } from './stats.service.js';
import { StatsQueryDto } from './dto/stats-query.dto.js';
import { StatsOverviewResponseDto } from './dto/stats-overview-response.dto.js';
import { StatsDealsResponseDto } from './dto/stats-deals-response.dto.js';

@ApiTags('Statistics')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // Get statistics overview
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get statistics overview',
    description:
      'Returns overview statistics for companies, contacts, tasks, and deals for the selected date range. Only ADMIN and MANAGER users can access statistics.',
  })
  @ApiOkResponse({
    description: 'Statistics overview returned successfully.',
    type: StatsOverviewResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Date range parameters are invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only ADMIN and MANAGER users can access statistics.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get('overview')
  getStats(@Query() query: StatsQueryDto) {
    return this.statsService.getStats(query);
  }

  // Get deal statistics
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get deal statistics',
    description:
      'Returns deal counts and total values grouped by status for the selected date range. Only ADMIN and MANAGER users can access statistics.',
  })
  @ApiOkResponse({
    description: 'Deal statistics returned successfully.',
    type: StatsDealsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Date range parameters are invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only ADMIN and MANAGER users can access statistics.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get('deals')
  getStatsDeals(@Query() query: StatsQueryDto) {
    return this.statsService.getStatsDeals(query);
  }
}