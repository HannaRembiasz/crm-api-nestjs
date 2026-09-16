import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { ContactQueryDto } from './dto/contact-query.dto.js';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async getAllContacts(query: ContactQueryDto) {
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

  async getContactById(id: number) {
    const contact = await this.prisma.client.orm.public.Contact.first({
      id: id,
    });

    if (!contact) {
      throw new NotFoundException(`Contact not found`);
    }

    return contact;
  }

  async getContactCompany(id: number) {
    const contact = await this.prisma.client.orm.public.Contact.where({
      id: id,
    })
      .include('company')
      .first();

    if (!contact) {
      throw new NotFoundException(`Contact not found`);
    }

    return contact;
  }

  async createContact(dto: CreateContactDto) {
    return this.prisma.client.orm.public.Contact.create(dto);
  }

  async updateContact(id: number, dto: UpdateContactDto) {
    const contact = await this.prisma.client.orm.public.Contact.where({
      id: id,
    }).update(dto);

    if (!contact) {
      throw new NotFoundException(`Contact not found`);
    }

    return contact;
  }

  async deleteContact(id: number) {
    const contact = await this.prisma.client.orm.public.Contact.where({
      id: id,
    }).delete();

    if (!contact) {
      throw new NotFoundException(`Contact not found`);
    }

    return;
  }
}
