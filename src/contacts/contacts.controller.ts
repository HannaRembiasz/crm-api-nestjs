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
} from '@nestjs/common';
import { ContactsService } from './contacts.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { ContactQueryDto } from './dto/contact-query.dto.js';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  getAllContacts(@Query() query: ContactQueryDto) {
    return this.contactsService.getAllContacts(query);
  }

  @Get(':id')
  getContactById(@Param('id') id: string) {
    return this.contactsService.getContactById(Number(id));
  }

  @Get(':id/company')
  getContactCompany(@Param('id') id: string) {
    return this.contactsService.getContactCompany(Number(id));
  }

  @Post()
  createContact(@Body() dto: CreateContactDto) {
    return this.contactsService.createContact(dto);
  }

  @Patch(':id')
  updateContact(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.contactsService.updateContact(Number(id), dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteContact(@Param('id') id: string) {
    return this.contactsService.deleteContact(Number(id));
  }
}
