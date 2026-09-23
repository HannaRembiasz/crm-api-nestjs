import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
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

import { ContactsService } from './contacts.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { ContactQueryDto } from './dto/contact-query.dto.js';
import { ContactResponseDto } from './dto/contact-response.dto.js';
import { ContactCompanyResponseDto } from './dto/contact-company-response.dto.js';

@ApiTags('Contacts')
@ApiBearerAuth()
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  // Get all contacts
  @ApiOperation({
    summary: 'Get all contacts',
    description:
      'Returns a paginated list of contacts with optional filtering and sorting.',
  })
  @ApiQuery({
    name: 'firstName',
    required: false,
    description: 'Filter contacts by first name.',
    example: 'John',
  })
  @ApiQuery({
    name: 'lastName',
    required: false,
    description: 'Filter contacts by last name.',
    example: 'Smith',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Filter contacts by email address.',
    example: 'john@example.com',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    description: 'Filter contacts by company ID.',
    example: 1,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of contacts per page.',
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['firstName', 'lastName', 'email', 'createdAt'],
    description: 'Field used to sort the results.',
    example: 'firstName',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort direction.',
    example: 'asc',
  })
  @ApiOkResponse({
    description: 'Contacts returned successfully.',
    type: [ContactResponseDto],
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
  getAllContacts(@Query() query: ContactQueryDto) {
    return this.contactsService.getAllContacts(query);
  }

  // Get contact by ID
  @ApiOperation({
    summary: 'Get contact by ID',
    description: 'Returns a single contact using its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Contact identifier.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Contact found successfully.',
    type: ContactResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Contact ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiNotFoundResponse({
    description: 'Contact not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get(':id')
  getContactById(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.getContactById(id);
  }

  // Get contact company
  @ApiOperation({
    summary: 'Get contact company',
    description:
      'Returns a contact together with the company associated with it.',
  })
  @ApiParam({
    name: 'id',
    description: 'Contact identifier.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Contact and company returned successfully.',
    type: ContactCompanyResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Contact ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiNotFoundResponse({
    description: 'Contact not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Get(':id/company')
  getContactCompany(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.getContactCompany(id);
  }

  // Create contact
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Create contact',
    description:
      'Creates a new contact. Only ADMIN and MANAGER users can create contacts.',
  })
  @ApiCreatedResponse({
    description: 'Contact created successfully.',
    type: ContactResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Request data is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only ADMIN and MANAGER users can create contacts.',
  })
  @ApiNotFoundResponse({
    description: 'Company not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Post()
  createContact(@Body() dto: CreateContactDto) {
    return this.contactsService.createContact(dto);
  }

  // Update contact
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update contact',
    description:
      'Updates an existing contact. Only ADMIN and MANAGER users can update contacts.',
  })
  @ApiParam({
    name: 'id',
    description: 'Contact identifier.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Contact updated successfully.',
    type: ContactResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Contact ID or request data is invalid.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only ADMIN and MANAGER users can update contacts.',
  })
  @ApiNotFoundResponse({
    description: 'Contact or company not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Patch(':id')
  updateContact(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactsService.updateContact(id, dto);
  }

  // Delete contact
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Delete contact',
    description:
      'Deletes a contact. Only ADMIN and MANAGER users can delete contacts.',
  })
  @ApiParam({
    name: 'id',
    description: 'Contact identifier.',
    example: 1,
  })
  @ApiNoContentResponse({
    description: 'Contact deleted successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Contact ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Only ADMIN and MANAGER users can delete contacts.',
  })
  @ApiNotFoundResponse({
    description: 'Contact not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error.',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteContact(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.deleteContact(id);
  }
}
