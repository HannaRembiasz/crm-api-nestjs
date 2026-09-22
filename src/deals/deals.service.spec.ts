import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { vi } from 'vitest';

import { DealsService } from './deals.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from '../users/dto/create-user.dto.js';
import { DealStatus } from './dto/create-deal.dto.js';

describe('DealsService', () => {
  let service: DealsService;

  const prismaMock = {
    client: {
      orm: {
        public: {
          Deal: {
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
          User: {
            first: vi.fn(),
          },
        },
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DealsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<DealsService>(DealsService);

    vi.clearAllMocks();

    const dealQuery = prismaMock.client.orm.public.Deal;

    dealQuery.where.mockReturnValue(dealQuery);
    dealQuery.include.mockReturnValue(dealQuery);
    dealQuery.orderBy.mockReturnValue(dealQuery);
    dealQuery.limit.mockReturnValue(dealQuery);
    dealQuery.offset.mockReturnValue(dealQuery);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // getDealById

  it('should return an accessible deal', async () => {
    const deal = {
      id: 1,
      title: 'Test deal',
      assignedToId: 20,
      status: DealStatus.LEAD,
    };

    prismaMock.client.orm.public.Deal.first.mockResolvedValue(deal);

    const result = await service.getDealById(
      1,
      20,
      UserRole.EMPLOYEE,
    );

    expect(result).toEqual(deal);
  });

  it('should reject an employee accessing another employee deal', async () => {
    prismaMock.client.orm.public.Deal.first.mockResolvedValue({
      id: 1,
      title: 'Other deal',
      assignedToId: 10,
      status: DealStatus.LEAD,
    });

    await expect(
      service.getDealById(1, 20, UserRole.EMPLOYEE),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException when deal does not exist', async () => {
    prismaMock.client.orm.public.Deal.first.mockResolvedValue(undefined);

    await expect(
      service.getDealById(999, 20, UserRole.EMPLOYEE),
    ).rejects.toThrow(NotFoundException);
  });

  // getAllDeals

  it('should return only deals assigned to the employee', async () => {
    const deals = [
      {
        id: 1,
        title: 'Employee deal',
        assignedToId: 20,
      },
    ];

    prismaMock.client.orm.public.Deal.all.mockResolvedValue(deals);

    const result = await service.getAllDeals(
      {},
      20,
      UserRole.EMPLOYEE,
    );

    expect(result).toEqual(deals);

    expect(prismaMock.client.orm.public.Deal.where).toHaveBeenCalledWith({
      assignedToId: 20,
    });
  });

  it('should filter deals by assignedToId for a manager', async () => {
    const deals = [
      {
        id: 1,
        title: 'Employee deal',
        assignedToId: 20,
      },
    ];

    prismaMock.client.orm.public.Deal.all.mockResolvedValue(deals);

    const result = await service.getAllDeals(
      {
        assignedToId: 20,
      },
      1,
      UserRole.MANAGER,
    );

    expect(result).toEqual(deals);

    expect(prismaMock.client.orm.public.Deal.where).toHaveBeenCalledWith({
      assignedToId: 20,
    });
  });

  it('should apply deal query filters', async () => {
    prismaMock.client.orm.public.Deal.all.mockResolvedValue([]);

    await service.getAllDeals(
      {
        title: 'important',
        status: DealStatus.NEGOTIATION,
        companyId: 5,
      },
      1,
      UserRole.MANAGER,
    );

    const whereMock = prismaMock.client.orm.public.Deal.where;

    expect(whereMock).toHaveBeenCalledTimes(3);

    expect(whereMock).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
    );

    expect(whereMock).toHaveBeenNthCalledWith(2, {
      status: DealStatus.NEGOTIATION,
    });

    expect(whereMock).toHaveBeenNthCalledWith(3, {
      companyId: 5,
    });
  });

  it('should apply pagination and sorting', async () => {
    prismaMock.client.orm.public.Deal.all.mockResolvedValue([]);

    await service.getAllDeals(
      {
        page: 2,
        limit: 5,
        sortBy: 'value',
        sortOrder: 'desc',
      },
      1,
      UserRole.MANAGER,
    );

    expect(
      prismaMock.client.orm.public.Deal.orderBy,
    ).toHaveBeenCalledTimes(1);

    expect(
      prismaMock.client.orm.public.Deal.limit,
    ).toHaveBeenCalledWith(5);

    expect(
      prismaMock.client.orm.public.Deal.offset,
    ).toHaveBeenCalledWith(5);

    expect(
      prismaMock.client.orm.public.Deal.all,
    ).toHaveBeenCalledTimes(1);
  });

  // getDealCompany

  it('should return the company for an accessible deal', async () => {
    const deal = {
      id: 1,
      assignedToId: 20,
      company: {
        id: 5,
        name: 'Test Company',
      },
    };

    prismaMock.client.orm.public.Deal.first.mockResolvedValue(deal);

    const result = await service.getDealCompany(
      1,
      20,
      UserRole.EMPLOYEE,
    );

    expect(result).toEqual(deal);

    expect(
      prismaMock.client.orm.public.Deal.where,
    ).toHaveBeenCalledWith({ id: 1 });

    expect(
      prismaMock.client.orm.public.Deal.include,
    ).toHaveBeenCalledWith('company');
  });

  it('should reject an employee accessing the company of another employee deal', async () => {
    prismaMock.client.orm.public.Deal.first.mockResolvedValue({
      id: 1,
      assignedToId: 10,
      company: {
        id: 5,
        name: 'Test Company',
      },
    });

    await expect(
      service.getDealCompany(1, 20, UserRole.EMPLOYEE),
    ).rejects.toThrow(ForbiddenException);
  });

  // getDealUser

  it('should return the assigned user for an accessible deal', async () => {
    const deal = {
      id: 1,
      assignedToId: 20,
      assignedTo: {
        id: 20,
        name: 'Employee',
      },
    };

    prismaMock.client.orm.public.Deal.first.mockResolvedValue(deal);

    const result = await service.getDealUser(
      1,
      20,
      UserRole.EMPLOYEE,
    );

    expect(result).toEqual(deal);

    expect(
      prismaMock.client.orm.public.Deal.where,
    ).toHaveBeenCalledWith({ id: 1 });

    expect(
      prismaMock.client.orm.public.Deal.include,
    ).toHaveBeenCalledWith('assignedTo');
  });

  it('should reject an employee accessing the user of another employee deal', async () => {
    prismaMock.client.orm.public.Deal.first.mockResolvedValue({
      id: 1,
      assignedToId: 10,
      assignedTo: {
        id: 10,
        name: 'Other Employee',
      },
    });

    await expect(
      service.getDealUser(1, 20, UserRole.EMPLOYEE),
    ).rejects.toThrow(ForbiddenException);
  });

 //createDeal

  it('should assign a deal to the employee creating it', async () => {
    prismaMock.client.orm.public.Company.first.mockResolvedValue({
      id: 5,
    });

    prismaMock.client.orm.public.User.first.mockResolvedValue({
      id: 20,
    });

    prismaMock.client.orm.public.Deal.create.mockResolvedValue({
      id: 1,
      title: 'Employee deal',
      status: DealStatus.LEAD,
      companyId: 5,
      assignedToId: 20,
    });

    const result = await service.createDeal(
      {
        title: 'Employee deal',
        status: DealStatus.LEAD,
        companyId: 5,
      },
      20,
      UserRole.EMPLOYEE,
    );

    expect(result.assignedToId).toBe(20);

    expect(
      prismaMock.client.orm.public.Deal.create,
    ).toHaveBeenCalledWith({
      title: 'Employee deal',
      status: DealStatus.LEAD,
      companyId: 5,
      assignedToId: 20,
    });
  });

  it('should reject a manager creating a deal without assignedToId', async () => {
    await expect(
      service.createDeal(
        {
          title: 'Manager deal',
          status: DealStatus.LEAD,
          companyId: 5,
        },
        1,
        UserRole.MANAGER,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject a deal with a nonexistent company', async () => {
    prismaMock.client.orm.public.Company.first.mockResolvedValue(
      undefined,
    );

    await expect(
      service.createDeal(
        {
          title: 'Test deal',
          status: DealStatus.LEAD,
          companyId: 999,
          assignedToId: 20,
        },
        1,
        UserRole.MANAGER,
      ),
    ).rejects.toThrow(NotFoundException);

    expect(
      prismaMock.client.orm.public.Company.first,
    ).toHaveBeenCalledWith({ id: 999 });
  });

  it('should reject a deal with a nonexistent assigned user', async () => {
    prismaMock.client.orm.public.Company.first.mockResolvedValue({
      id: 5,
    });

    prismaMock.client.orm.public.User.first.mockResolvedValue(
      undefined,
    );

    await expect(
      service.createDeal(
        {
          title: 'Test deal',
          status: DealStatus.LEAD,
          companyId: 5,
          assignedToId: 999,
        },
        1,
        UserRole.MANAGER,
      ),
    ).rejects.toThrow(NotFoundException);

    expect(
      prismaMock.client.orm.public.User.first,
    ).toHaveBeenCalledWith({ id: 999 });
  });

  //updateDeal

  it('should allow an employee to update their own deal', async () => {
    const deal = {
      id: 1,
      title: 'Old title',
      assignedToId: 20,
      status: DealStatus.LEAD,
    };

    const updatedDeal = {
      ...deal,
      title: 'New title',
    };

    prismaMock.client.orm.public.Deal.first.mockResolvedValue(deal);
    prismaMock.client.orm.public.Deal.update.mockResolvedValue(
      updatedDeal,
    );

    const result = await service.updateDeal(
      1,
      20,
      UserRole.EMPLOYEE,
      {
        title: 'New title',
      },
    );

    expect(result).toEqual(updatedDeal);

    expect(
      prismaMock.client.orm.public.Deal.update,
    ).toHaveBeenCalledWith({
      title: 'New title',
    });
  });

  it('should reject an employee updating another employee deal', async () => {
    prismaMock.client.orm.public.Deal.first.mockResolvedValue({
      id: 1,
      title: 'Other deal',
      assignedToId: 10,
      status: DealStatus.LEAD,
    });

    await expect(
      service.updateDeal(
        1,
        20,
        UserRole.EMPLOYEE,
        {
          title: 'New title',
        },
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(
      prismaMock.client.orm.public.Deal.update,
    ).not.toHaveBeenCalled();
  });

  it('should reject an employee reassigning a deal', async () => {
    prismaMock.client.orm.public.Deal.first.mockResolvedValue({
      id: 1,
      title: 'Test deal',
      assignedToId: 20,
      status: DealStatus.LEAD,
    });

    await expect(
      service.updateDeal(
        1,
        20,
        UserRole.EMPLOYEE,
        {
          assignedToId: 30,
        },
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(
      prismaMock.client.orm.public.Deal.update,
    ).not.toHaveBeenCalled();
  });

  it('should reject an employee reopening a won deal', async () => {
    prismaMock.client.orm.public.Deal.first.mockResolvedValue({
      id: 1,
      title: 'Won deal',
      assignedToId: 20,
      status: DealStatus.WON,
    });

    await expect(
      service.updateDeal(
        1,
        20,
        UserRole.EMPLOYEE,
        {
          status: DealStatus.LEAD,
        },
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(
      prismaMock.client.orm.public.Deal.update,
    ).not.toHaveBeenCalled();
  });

  it('should reject an employee reopening a lost deal', async () => {
    prismaMock.client.orm.public.Deal.first.mockResolvedValue({
      id: 1,
      title: 'Lost deal',
      assignedToId: 20,
      status: DealStatus.LOST,
    });

    await expect(
      service.updateDeal(
        1,
        20,
        UserRole.EMPLOYEE,
        {
          status: DealStatus.CONTACTED,
        },
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(
      prismaMock.client.orm.public.Deal.update,
    ).not.toHaveBeenCalled();
  });

  // deleteDeal

  it('should delete an existing deal', async () => {
    prismaMock.client.orm.public.Deal.delete.mockResolvedValue({
      id: 1,
    });

    const result = await service.deleteDeal(1);

    expect(result).toBeUndefined();

    expect(
      prismaMock.client.orm.public.Deal.where,
    ).toHaveBeenCalledWith({ id: 1 });

    expect(
      prismaMock.client.orm.public.Deal.delete,
    ).toHaveBeenCalled();
  });

  it('should throw NotFoundException when deleting a nonexistent deal', async () => {
    prismaMock.client.orm.public.Deal.delete.mockResolvedValue(
      undefined,
    );

    await expect(
      service.deleteDeal(999),
    ).rejects.toThrow(NotFoundException);

    expect(
      prismaMock.client.orm.public.Deal.where,
    ).toHaveBeenCalledWith({ id: 999 });
  });
});