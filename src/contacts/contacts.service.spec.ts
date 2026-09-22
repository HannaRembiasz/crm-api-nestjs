import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { vi } from 'vitest';

import { ContactsService } from './contacts.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('ContactsService', () => {
  let service: ContactsService;

  const prismaMock = {
    client: {
      orm: {
        public: {
          Contact: {
            first: vi.fn(),
            where: vi.fn(),
            include: vi.fn(),
            orderBy: vi.fn(),
            limit: vi.fn(),
            offset: vi.fn(),
            all: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
          },
          Company: {
            first: vi.fn(),
          },
        },
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);

    vi.clearAllMocks();

    const contactQuery = prismaMock.client.orm.public.Contact;

    contactQuery.where.mockReturnValue(contactQuery);
    contactQuery.include.mockReturnValue(contactQuery);
    contactQuery.orderBy.mockReturnValue(contactQuery);
    contactQuery.limit.mockReturnValue(contactQuery);
    contactQuery.offset.mockReturnValue(contactQuery);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // getAllContacts

  it('should apply contact query filters', async () => {
    prismaMock.client.orm.public.Contact.all.mockResolvedValue([]);

    await service.getAllContacts({
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@example.com',
      companyId: 5,
    });

    const whereMock = prismaMock.client.orm.public.Contact.where;

    expect(whereMock).toHaveBeenCalledTimes(4);

    expect(whereMock).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
    );

    expect(whereMock).toHaveBeenNthCalledWith(
      2,
      expect.any(Function),
    );

    expect(whereMock).toHaveBeenNthCalledWith(
      3,
      expect.any(Function),
    );

    expect(whereMock).toHaveBeenNthCalledWith(
      4,
      {
        companyId: 5,
      },
    );
  });

  it('should apply pagination and sorting', async () => {
    prismaMock.client.orm.public.Contact.all.mockResolvedValue([]);

    await service.getAllContacts({
      page: 2,
      limit: 5,
      sortBy: 'lastName',
      sortOrder: 'desc',
    });

    expect(
      prismaMock.client.orm.public.Contact.orderBy,
    ).toHaveBeenCalledTimes(1);

    expect(
      prismaMock.client.orm.public.Contact.limit,
    ).toHaveBeenCalledWith(5);

    expect(
      prismaMock.client.orm.public.Contact.offset,
    ).toHaveBeenCalledWith(5);

    expect(
      prismaMock.client.orm.public.Contact.all,
    ).toHaveBeenCalledTimes(1);
  });

  // getContactById

  it('should return a contact by id', async () => {
    const contact = {
      id: 1,
      firstName: 'John',
      lastName: 'Smith',
    };

    prismaMock.client.orm.public.Contact.first.mockResolvedValue(
      contact,
    );

    const result = await service.getContactById(1);

    expect(result).toEqual(contact);

    expect(
      prismaMock.client.orm.public.Contact.first,
    ).toHaveBeenCalledWith({ id: 1 });
  });

  it('should throw NotFoundException when contact does not exist', async () => {
    prismaMock.client.orm.public.Contact.first.mockResolvedValue(
      undefined,
    );

    await expect(
      service.getContactById(999),
    ).rejects.toThrow(NotFoundException);
  });

  // getContactCompany

  it('should return the company for a contact', async () => {
    const contact = {
      id: 1,
      firstName: 'John',
      company: {
        id: 5,
        name: 'Acme',
      },
    };

    prismaMock.client.orm.public.Contact.first.mockResolvedValue(
      contact,
    );

    const result = await service.getContactCompany(1);

    expect(result).toEqual(contact);

    expect(
      prismaMock.client.orm.public.Contact.where,
    ).toHaveBeenCalledWith({ id: 1 });

    expect(
      prismaMock.client.orm.public.Contact.include,
    ).toHaveBeenCalledWith('company');
  });

  it('should throw NotFoundException when contact company target does not exist', async () => {
    prismaMock.client.orm.public.Contact.first.mockResolvedValue(
      undefined,
    );

    await expect(
      service.getContactCompany(999),
    ).rejects.toThrow(NotFoundException);
  });

  // createContact

  it('should create a contact when the company exists', async () => {
    const dto = {
      firstName: 'John',
      lastName: 'Smith',
      companyId: 5,
    };

    const createdContact = {
      id: 1,
      ...dto,
    };

    prismaMock.client.orm.public.Company.first.mockResolvedValue({
      id: 5,
    });

    prismaMock.client.orm.public.Contact.create.mockResolvedValue(
      createdContact,
    );

    const result = await service.createContact(dto);

    expect(result).toEqual(createdContact);

    expect(
      prismaMock.client.orm.public.Company.first,
    ).toHaveBeenCalledWith({ id: 5 });

    expect(
      prismaMock.client.orm.public.Contact.create,
    ).toHaveBeenCalledWith(dto);
  });

  it('should reject creating a contact for a nonexistent company', async () => {
    prismaMock.client.orm.public.Company.first.mockResolvedValue(
      undefined,
    );

    await expect(
      service.createContact({
        firstName: 'John',
        lastName: 'Smith',
        companyId: 999,
      }),
    ).rejects.toThrow(NotFoundException);

    expect(
      prismaMock.client.orm.public.Contact.create,
    ).not.toHaveBeenCalled();
  });

  // updateContact

  it('should update an existing contact', async () => {
    const updatedContact = {
      id: 1,
      firstName: 'Jane',
      lastName: 'Smith',
      companyId: 5,
    };

    prismaMock.client.orm.public.Company.first.mockResolvedValue({
      id: 5,
    });

    prismaMock.client.orm.public.Contact.update.mockResolvedValue(
      updatedContact,
    );

    const result = await service.updateContact(1, {
      firstName: 'Jane',
      companyId: 5,
    });

    expect(result).toEqual(updatedContact);

    expect(
      prismaMock.client.orm.public.Company.first,
    ).toHaveBeenCalledWith({ id: 5 });

    expect(
      prismaMock.client.orm.public.Contact.where,
    ).toHaveBeenCalledWith({ id: 1 });

    expect(
      prismaMock.client.orm.public.Contact.update,
    ).toHaveBeenCalledWith({
      firstName: 'Jane',
      companyId: 5,
    });
  });

  it('should reject updating a contact with a nonexistent company', async () => {
    prismaMock.client.orm.public.Company.first.mockResolvedValue(
      undefined,
    );

    await expect(
      service.updateContact(1, {
        companyId: 999,
      }),
    ).rejects.toThrow(NotFoundException);

    expect(
      prismaMock.client.orm.public.Contact.update,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when updating a nonexistent contact', async () => {
    prismaMock.client.orm.public.Contact.update.mockResolvedValue(
      undefined,
    );

    await expect(
      service.updateContact(999, {
        firstName: 'Jane',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  // deleteContact

  it('should delete an existing contact', async () => {
    prismaMock.client.orm.public.Contact.delete.mockResolvedValue({
      id: 1,
    });

    const result = await service.deleteContact(1);

    expect(result).toBeUndefined();

    expect(
      prismaMock.client.orm.public.Contact.where,
    ).toHaveBeenCalledWith({ id: 1 });

    expect(
      prismaMock.client.orm.public.Contact.delete,
    ).toHaveBeenCalled();
  });

  it('should throw NotFoundException when deleting a nonexistent contact', async () => {
    prismaMock.client.orm.public.Contact.delete.mockResolvedValue(
      undefined,
    );

    await expect(
      service.deleteContact(999),
    ).rejects.toThrow(NotFoundException);
  });
});