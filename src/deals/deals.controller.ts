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
  ParseIntPipe,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import type { AuthenticatedRequest } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '../users/dto/create-user.dto.js';
import { CreateDealDto } from './dto/create-deal.dto.js';
import { UpdateDealDto } from './dto/update-deal.dto.js';
import { DealResponseDto } from './dto/deal-response.dto.js';
import { DealCompanyResponseDto } from './dto/deal-company-response.dto.js';
import { DealUserResponseDto } from './dto/deal-user-response.dto.js';import { DealsService } from './deals.service.js';
import { DealQueryDto } from './dto/deal-query.dto.js';

@ApiTags('Deals')
@ApiBearerAuth()
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @ApiOperation({
    summary: 'Get all deals',
    description:
      'Returns a paginated list of deals with optional filtering and sorting. EMPLOYEE can only see deals assigned to themselves.',
  })
  @ApiOkResponse({
    description: 'Deals returned successfully.',
    type: [DealResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Query parameters are invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get()
  getAllDeals(
    @Query() query: DealQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.dealsService.getAllDeals(
      query,
      request.user.sub,
      request.user.role,
    );
  }

  // Get deal by ID
  @ApiOperation({
    summary: 'Get deal by ID',
    description:
      'Returns a single deal using its unique identifier. EMPLOYEE can only access deals assigned to themselves.',
  })
  @ApiParam({
    name: 'id',
    description: 'Deal identifier.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Deal found successfully.',
    type: DealResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Deal ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to access this deal.',
  })
  @ApiNotFoundResponse({
    description: 'Deal not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get(':id')
  getDealById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.dealsService.getDealById(
      id,
      request.user.sub,
      request.user.role,
    );
  }

  // Get deal with company
  @ApiOperation({
    summary: 'Get deal with company',
    description:
      'Returns a deal together with the company associated with it. EMPLOYEE can only access their own deals.',
  })
  @ApiParam({
    name: 'id',
    description: 'Deal identifier.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Deal and company returned successfully.',
    type: DealCompanyResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Deal ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'You cannot access this deal.',
  })
  @ApiNotFoundResponse({
    description: 'Deal not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get(':id/company')
  getCompanyByDealId(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.dealsService.getDealCompany(
      id,
      request.user.sub,
      request.user.role,
    );
  }

  // Get deal with assigned user
  @ApiOperation({
    summary: 'Get deal with assigned user',
    description:
      'Returns a deal together with the user assigned to it. EMPLOYEE can only access their own deals.',
  })
  @ApiParam({
    name: 'id',
    description: 'Deal identifier.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Deal and assigned user returned successfully.',
    type: DealUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Deal ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'You cannot access this deal.',
  })
  @ApiNotFoundResponse({
    description: 'Deal not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get(':id/user')
  getDealUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.dealsService.getDealUser(
      id,
      request.user.sub,
      request.user.role,
    );
  }

  // Create a new deal
  @ApiOperation({
    summary: 'Create deal',
    description:
      'Creates a new deal. EMPLOYEE can create deals for themselves, while ADMIN and MANAGER can create deals for any user.',
  })
  @ApiCreatedResponse({
    description: 'Deal created successfully.',
    type: DealResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Request data is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'You do not have permission to create this deal.',
  })
  @ApiNotFoundResponse({
    description: 'Referenced company or user was not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Post()
  createDeal(@Body() dto: CreateDealDto, @Req() request: AuthenticatedRequest) {
    return this.dealsService.createDeal(
      dto,
      request.user.sub,
      request.user.role,
    );
  }

  // Update deal by ID
  @ApiOperation({
    summary: 'Update deal',
    description:
      'Updates an existing deal. Only provided fields are changed. EMPLOYEE can update their own deals but cannot reassign them or reopen a closed deal (WON or LOST). ADMIN and MANAGER can update any deal.',
  })
  @ApiParam({
    name: 'id',
    description: 'Deal identifier.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Deal updated successfully.',
    type: DealResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Deal ID or request data is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Employee cannot update a deal assigned to another user, reassign a deal, or reopen a closed deal (WON or LOST).',
  })
  @ApiNotFoundResponse({
    description: 'Deal or referenced user was not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Patch(':id')
  updateDeal(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDealDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.dealsService.updateDeal(
      id,
      request.user.sub,
      request.user.role,
      dto,
    );
  }

  // Delete deal by ID
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Delete deal',
    description:
      'Deletes a deal. Only ADMIN and MANAGER users can delete deals.',
  })
  @ApiParam({
    name: 'id',
    description: 'Deal identifier.',
    example: 1,
  })
  @ApiNoContentResponse({
    description: 'Deal deleted successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Deal ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only ADMIN and MANAGER users can delete deals.',
  })
  @ApiNotFoundResponse({
    description: 'Deal not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDeal(@Param('id', ParseIntPipe) id: number) {
    return this.dealsService.deleteDeal(id);
  }
}
