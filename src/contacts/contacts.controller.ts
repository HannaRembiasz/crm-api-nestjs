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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '../users/dto/create-user.dto.js';
import { ContactsService } from './contacts.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { ContactQueryDto } from './dto/contact-query.dto.js';

@ApiTags('Contacts')
@ApiBearerAuth()
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  getAllContacts(@Query() query: ContactQueryDto) {
    return this.contactsService.getAllContacts(query);
  }

  @Get(':id')
  getContactById(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.getContactById(id);
  }

  @Get(':id/company')
  getContactCompany(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.getContactCompany(id);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @Post()
  createContact(@Body() dto: CreateContactDto) {
    return this.contactsService.createContact(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @Patch(':id')
  updateContact(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactsService.updateContact(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteContact(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.deleteContact(id);
  }
}
