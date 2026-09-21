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
    if (query.companyId) {
      contacts = contacts.where({ companyId: query.companyId });
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    const sortOrder = query.sortOrder ?? 'asc';

    switch (query.sortBy ?? 'firstName') {
      case 'firstName':
        contacts = contacts.orderBy((contact) =>
          sortOrder === 'asc'
            ? contact.firstName.asc()
            : contact.firstName.desc(),
        );
        break;

      case 'lastName':
        contacts = contacts.orderBy((contact) =>
          sortOrder === 'asc'
            ? contact.lastName.asc()
            : contact.lastName.desc(),
        );
        break;

      case 'email':
        contacts = contacts.orderBy((contact) =>
          sortOrder === 'asc' ? contact.email.asc() : contact.email.desc(),
        );
        break;

      case 'createdAt':
        contacts = contacts.orderBy((contact) =>
          sortOrder === 'asc'
            ? contact.createdAt.asc()
            : contact.createdAt.desc(),
        );
        break;
    }

    return contacts.limit(limit).offset(offset).all();
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
    const company = await this.prisma.client.orm.public.Company.first({
      id: dto.companyId,
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.prisma.client.orm.public.Contact.create(dto);
  }

  async updateContact(id: number, dto: UpdateContactDto) {
    if (dto.companyId !== undefined) {
      const company = await this.prisma.client.orm.public.Company.first({
        id: dto.companyId,
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    const contact = await this.prisma.client.orm.public.Contact.where({
      id,
    }).update(dto);

    if (!contact) {
      throw new NotFoundException('Contact not found');
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
