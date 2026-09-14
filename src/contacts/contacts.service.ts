import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  getAllContacts() {
    return this.prisma.client.orm.public.Contact.all();
  }
}
