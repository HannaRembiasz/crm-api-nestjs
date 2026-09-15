import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { ContactQueryDto } from './dto/contact-query.dto.js';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  getAllContacts(query: ContactQueryDto) {
    let contacts = this.prisma.client.orm.public.Contact;

    if (query.firstName) {
      contacts = contacts.where((contact) =>
        contact.firstName.ilike(`%${query.firstName}%`),
      );
    }
    if (query.lastName) {
      contacts = contacts.where((contact) =>
        contact.lastName.ilike(`%${query.lastName}%`),
      );
    }
    if (query.email) {
      contacts = contacts.where((contact) =>
        contact.email.ilike(`%${query.email}%`),
      );
    }

    return contacts.all();
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
