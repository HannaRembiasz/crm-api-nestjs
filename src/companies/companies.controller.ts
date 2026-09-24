import {
  Controller,
  Query,
  Get,
  ParseIntPipe,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '../users/dto/create-user.dto.js';
import { CompaniesService } from './companies.service.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';
import { CompanyQueryDto } from './dto/company-query.dto.js';
import type { AuthenticatedRequest } from '../auth/auth.guard.js';
import { CompanyResponseDto } from './dto/company-response.dto.js';
import { DealResponseDto } from '../deals/dto/deal-response.dto.js';
import { TaskResponseDto } from '../tasks/dto/task-response.dto.js';
import { ContactResponseDto } from '../contacts/dto/contact-response.dto.js';
import { CompanyOverviewResponseDto } from './dto/company-overview-response.dto.js';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  // Get all companies endpoint
  @ApiOperation({
    summary: 'Get all companies',
    description:
      'Returns a paginated list of companies with optional name, city, and country filters.',
  })
  @ApiOkResponse({
    description: 'Companies returned successfully.',
    type: [CompanyResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get()
  getAllCompanies(@Query() query: CompanyQueryDto) {
    return this.companiesService.getAllCompanies(query);
  }

  // Get company by ID endpoint
  @ApiOperation({
    summary: 'Get company by ID',
    description: 'Returns a single company using its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Company identifier.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Company found successfully.',
    type: CompanyResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Company ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiNotFoundResponse({
    description: 'Company not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get(':id')
  getCompanyById(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.getCompanyById(id);
  }

  // Get company overview endpoint
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get company overview',
    description:
      'Returns the company together with its contacts, tasks, and deals. Only ADMIN and MANAGER users can access this information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Company identifier.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Company overview returned successfully.',
    type: CompanyOverviewResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Company ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only ADMIN and MANAGER users can access company overviews.',
  })
  @ApiNotFoundResponse({
    description: 'Company not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get(':id/overview')
  getCompanyOverview(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.getCompanyOverview(id);
  }

  // Get company contacts endpoint
  @ApiOperation({
    summary: 'Get company contacts',
    description: 'Returns all contacts associated with a company.',
  })
  @ApiParam({
    name: 'id',
    description: 'Company identifier.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Company contacts returned successfully.',
    type: [ContactResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Company ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiNotFoundResponse({
    description: 'Company not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get(':id/contacts')
  getCompanyContacts(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.getCompanyContacts(id);
  }

  // Get company tasks endpoint
  @ApiOperation({
    summary: 'Get company tasks',
    description:
      'Returns tasks associated with a company. Employees receive only tasks assigned to themselves.',
  })
  @ApiParam({
    name: 'id',
    description: 'Company identifier.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Company tasks returned successfully.',
    type: [TaskResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Company ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiNotFoundResponse({
    description: 'Company not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get(':id/tasks')
  getCompanyTasks(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.companiesService.getCompanyTasks(
      id,
      request.user.sub,
      request.user.role,
    );
  }

  // Get company deals endpoint
  @ApiOperation({
    summary: 'Get company deals',
    description:
      'Returns deals associated with a company. Employees receive only deals assigned to themselves.',
  })
  @ApiParam({
    name: 'id',
    description: 'Company identifier.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Company deals returned successfully.',
    type: [DealResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Company ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiNotFoundResponse({
    description: 'Company not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get(':id/deals')
  getCompanyDeals(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.companiesService.getCompanyDeals(
      id,
      request.user.sub,
      request.user.role,
    );
  }

  // Create company endpoint
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Create company',
    description:
      'Creates a new company. Only ADMIN and MANAGER users can create companies.',
  })
  @ApiCreatedResponse({
    description: 'Company created successfully.',
    type: CompanyResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Request data is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only ADMIN and MANAGER users can create companies.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Post()
  createCompany(@Body() dto: CreateCompanyDto) {
    return this.companiesService.createCompany(dto);
  }

  // Update company endpoint
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update company',
    description:
      'Updates an existing company. Only ADMIN and MANAGER users can update companies.',
  })
  @ApiParam({
    name: 'id',
    description: 'Company identifier.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Company updated successfully.',
    type: CompanyResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Company ID or request data is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only ADMIN and MANAGER users can update companies.',
  })
  @ApiNotFoundResponse({
    description: 'Company not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Patch(':id')
  updateCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.updateCompany(id, dto);
  }

  // Delete company endpoint
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Delete company',
    description:
      'Deletes a company. Only ADMIN and MANAGER users can delete companies.',
  })
  @ApiParam({
    name: 'id',
    description: 'Company identifier.',
    example: 1,
  })
  @ApiNoContentResponse({
    description: 'Company deleted successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Company ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only ADMIN and MANAGER users can delete companies.',
  })
  @ApiNotFoundResponse({
    description: 'Company not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCompany(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.deleteCompany(id);
  }
}
