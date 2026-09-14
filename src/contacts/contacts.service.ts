import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  getAllContacts() {
    return this.prisma.client.orm.public.Contact.all();
  }

  getContactById(id: number) {
    return this.prisma.client.orm.public.Contact.first({
      id: id,
    });
  }

  createContact(dto: CreateContactDto) {
    return this.prisma.client.orm.public.Contact.create(dto);
  }

  updateContact(id: number, dto: UpdateContactDto) {
    return this.prisma.client.orm.public.Contact.where({ id: id }).update(dto);
  }

  deleteContact(id: number) {
    return this.prisma.client.orm.public.Contact.where({ id: id }).delete();
  }
}
