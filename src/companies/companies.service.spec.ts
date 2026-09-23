import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { vi } from 'vitest';

import { CompaniesService } from './companies.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from '../users/dto/create-user.dto.js';

describe('CompaniesService', () => {
  let service: CompaniesService;

  const prismaMock = {
    client: {
      orm: {
        public: {
          Company: {
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
          Contact: {
            where: vi.fn(),
            all: vi.fn(),
          },
          Task: {
            where: vi.fn(),
            all: vi.fn(),
          },
          Deal: {
            where: vi.fn(),
            all: vi.fn(),
          },
        },
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);

    vi.clearAllMocks();

    const companyQuery = prismaMock.client.orm.public.Company;
    const contactQuery = prismaMock.client.orm.public.Contact;
    const taskQuery = prismaMock.client.orm.public.Task;
    const dealQuery = prismaMock.client.orm.public.Deal;

    companyQuery.where.mockReturnValue(companyQuery);
    companyQuery.include.mockReturnValue(companyQuery);
    companyQuery.orderBy.mockReturnValue(companyQuery);
    companyQuery.limit.mockReturnValue(companyQuery);
    companyQuery.offset.mockReturnValue(companyQuery);

    contactQuery.where.mockReturnValue(contactQuery);
    taskQuery.where.mockReturnValue(taskQuery);
    dealQuery.where.mockReturnValue(dealQuery);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // getAllCompanies
  it('should apply company query filters', async () => {
    prismaMock.client.orm.public.Company.all.mockResolvedValue([]);

    await service.getAllCompanies({
      name: 'Acme',
      city: 'Warsaw',
      country: 'Poland',
    });

    const whereMock = prismaMock.client.orm.public.Company.where;

    expect(whereMock).toHaveBeenCalledTimes(3);
    expect(whereMock).toHaveBeenNthCalledWith(1, expect.any(Function));
    expect(whereMock).toHaveBeenNthCalledWith(2, expect.any(Function));
    expect(whereMock).toHaveBeenNthCalledWith(3, expect.any(Function));
  });

  it('should apply pagination and sorting', async () => {
    prismaMock.client.orm.public.Company.all.mockResolvedValue([]);

    await service.getAllCompanies({
      page: 2,
      limit: 5,
      sortBy: 'city',
      sortOrder: 'desc',
    });

    expect(prismaMock.client.orm.public.Company.orderBy).toHaveBeenCalledTimes(
      1,
    );

    expect(prismaMock.client.orm.public.Company.limit).toHaveBeenCalledWith(5);

    expect(prismaMock.client.orm.public.Company.offset).toHaveBeenCalledWith(5);

    expect(prismaMock.client.orm.public.Company.all).toHaveBeenCalledTimes(1);
  });

  // createCompany

  it('should create a company', async () => {
    const dto = {
      name: 'Acme',
      city: 'Warsaw',
    };

    const createdCompany = {
      id: 1,
      ...dto,
    };

    prismaMock.client.orm.public.Company.create.mockResolvedValue(
      createdCompany,
    );

    const result = await service.createCompany(dto);

    expect(result).toEqual(createdCompany);

    expect(prismaMock.client.orm.public.Company.create).toHaveBeenCalledWith(
      dto,
    );
  });

  // getCompanyById

  it('should return a company by id', async () => {
    const company = {
      id: 1,
      name: 'Acme',
    };

    prismaMock.client.orm.public.Company.first.mockResolvedValue(company);

    const result = await service.getCompanyById(1);

    expect(result).toEqual(company);

    expect(prismaMock.client.orm.public.Company.first).toHaveBeenCalledWith({
      id: 1,
    });
  });

  it('should throw NotFoundException when company does not exist', async () => {
    prismaMock.client.orm.public.Company.first.mockResolvedValue(undefined);

    await expect(service.getCompanyById(999)).rejects.toThrow(
      NotFoundException,
    );
  });

  // getCompanyOverview

  it('should return company overview', async () => {
    const company = {
      id: 1,
      name: 'Acme',
    };

    const contacts = [{ id: 1, companyId: 1 }];
    const tasks = [{ id: 2, companyId: 1 }];
    const deals = [{ id: 3, companyId: 1 }];

    prismaMock.client.orm.public.Company.first.mockResolvedValue(company);
    prismaMock.client.orm.public.Contact.all.mockResolvedValue(contacts);
    prismaMock.client.orm.public.Task.all.mockResolvedValue(tasks);
    prismaMock.client.orm.public.Deal.all.mockResolvedValue(deals);

    const result = await service.getCompanyOverview(1);

    expect(result).toEqual({
      company,
      contacts,
      tasks,
      deals,
    });

    expect(prismaMock.client.orm.public.Contact.where).toHaveBeenCalledWith({
      companyId: 1,
    });

    expect(prismaMock.client.orm.public.Task.where).toHaveBeenCalledWith({
      companyId: 1,
    });

    expect(prismaMock.client.orm.public.Deal.where).toHaveBeenCalledWith({
      companyId: 1,
    });
  });

  it('should throw NotFoundException when overview company does not exist', async () => {
    prismaMock.client.orm.public.Company.first.mockResolvedValue(undefined);

    await expect(service.getCompanyOverview(999)).rejects.toThrow(
      NotFoundException,
    );
  });

  // getCompanyContacts
  it('should return company contacts', async () => {
    const company = {
      id: 1,
      name: 'Acme',
    };

    const contacts = [
      {
        id: 10,
        companyId: 1,
      },
    ];

    prismaMock.client.orm.public.Company.first.mockResolvedValue(company);

    prismaMock.client.orm.public.Contact.where.mockReturnValue({
      all: vi.fn().mockResolvedValue(contacts),
    } as any);

    const result = await service.getCompanyContacts(1);

    expect(result).toEqual(contacts);

    expect(prismaMock.client.orm.public.Company.where).toHaveBeenCalledWith({
      id: 1,
    });

    expect(prismaMock.client.orm.public.Company.first).toHaveBeenCalled();

    expect(prismaMock.client.orm.public.Contact.where).toHaveBeenCalledWith({
      companyId: 1,
    });
  });

  it('should throw NotFoundException when company contacts target does not exist', async () => {
    prismaMock.client.orm.public.Company.first.mockResolvedValue(undefined);

    await expect(service.getCompanyContacts(999)).rejects.toThrow(
      NotFoundException,
    );
  });

  // getCompanyTasks

  it('should return only employee-owned company tasks for an employee', async () => {
    const tasks = [
      {
        id: 1,
        companyId: 5,
        assignedToId: 20,
      },
    ];

    prismaMock.client.orm.public.Company.first.mockResolvedValue({
      id: 5,
    });

    prismaMock.client.orm.public.Task.all.mockResolvedValue(tasks);

    const result = await service.getCompanyTasks(5, 20, UserRole.EMPLOYEE);

    expect(result).toEqual(tasks);

    expect(prismaMock.client.orm.public.Task.where).toHaveBeenNthCalledWith(1, {
      companyId: 5,
    });

    expect(prismaMock.client.orm.public.Task.where).toHaveBeenNthCalledWith(2, {
      assignedToId: 20,
    });
  });

  it('should return all company tasks for a manager', async () => {
    const tasks = [
      { id: 1, companyId: 5, assignedToId: 20 },
      { id: 2, companyId: 5, assignedToId: 30 },
    ];

    prismaMock.client.orm.public.Company.first.mockResolvedValue({
      id: 5,
    });

    prismaMock.client.orm.public.Task.all.mockResolvedValue(tasks);

    const result = await service.getCompanyTasks(5, 1, UserRole.MANAGER);

    expect(result).toEqual(tasks);

    expect(prismaMock.client.orm.public.Task.where).toHaveBeenCalledTimes(1);

    expect(prismaMock.client.orm.public.Task.where).toHaveBeenCalledWith({
      companyId: 5,
    });
  });

  // getCompanyDeals

  it('should return only employee-owned company deals for an employee', async () => {
    const deals = [
      {
        id: 1,
        companyId: 5,
        assignedToId: 20,
      },
    ];

    prismaMock.client.orm.public.Company.first.mockResolvedValue({
      id: 5,
    });

    prismaMock.client.orm.public.Deal.all.mockResolvedValue(deals);

    const result = await service.getCompanyDeals(5, 20, UserRole.EMPLOYEE);

    expect(result).toEqual(deals);

    expect(prismaMock.client.orm.public.Deal.where).toHaveBeenNthCalledWith(1, {
      companyId: 5,
    });

    expect(prismaMock.client.orm.public.Deal.where).toHaveBeenNthCalledWith(2, {
      assignedToId: 20,
    });
  });

  it('should return all company deals for a manager', async () => {
    const deals = [
      { id: 1, companyId: 5, assignedToId: 20 },
      { id: 2, companyId: 5, assignedToId: 30 },
    ];

    prismaMock.client.orm.public.Company.first.mockResolvedValue({
      id: 5,
    });

    prismaMock.client.orm.public.Deal.all.mockResolvedValue(deals);

    const result = await service.getCompanyDeals(5, 1, UserRole.MANAGER);

    expect(result).toEqual(deals);

    expect(prismaMock.client.orm.public.Deal.where).toHaveBeenCalledTimes(1);

    expect(prismaMock.client.orm.public.Deal.where).toHaveBeenCalledWith({
      companyId: 5,
    });
  });

  // updateCompany

  it('should update an existing company', async () => {
    const updatedCompany = {
      id: 1,
      name: 'Updated Acme',
    };

    prismaMock.client.orm.public.Company.update.mockResolvedValue(
      updatedCompany,
    );

    const result = await service.updateCompany(1, {
      name: 'Updated Acme',
    });

    expect(result).toEqual(updatedCompany);

    expect(prismaMock.client.orm.public.Company.where).toHaveBeenCalledWith({
      id: 1,
    });

    expect(prismaMock.client.orm.public.Company.update).toHaveBeenCalledWith({
      name: 'Updated Acme',
    });
  });

  it('should throw NotFoundException when updating a nonexistent company', async () => {
    prismaMock.client.orm.public.Company.update.mockResolvedValue(undefined);

    await expect(
      service.updateCompany(999, {
        name: 'Updated',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  // deleteCompany

  it('should delete an existing company', async () => {
    prismaMock.client.orm.public.Company.delete.mockResolvedValue({
      id: 1,
    });

    const result = await service.deleteCompany(1);

    expect(result).toBeUndefined();

    expect(prismaMock.client.orm.public.Company.where).toHaveBeenCalledWith({
      id: 1,
    });

    expect(prismaMock.client.orm.public.Company.delete).toHaveBeenCalled();
  });

  it('should throw NotFoundException when deleting a nonexistent company', async () => {
    prismaMock.client.orm.public.Company.delete.mockResolvedValue(undefined);

    await expect(service.deleteCompany(999)).rejects.toThrow(NotFoundException);
  });
});
