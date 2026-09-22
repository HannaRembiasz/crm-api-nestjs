import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { StatsService } from './stats.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('StatsService', () => {
  let service: StatsService;

  const prismaMock = {
    client: {
      orm: {
        public: {
          Company: {
            where: vi.fn(),
            aggregate: vi.fn(),
          },
          Contact: {
            where: vi.fn(),
            aggregate: vi.fn(),
          },
          Task: {
            where: vi.fn(),
            groupBy: vi.fn(),
            aggregate: vi.fn(),
          },
          Deal: {
            where: vi.fn(),
            groupBy: vi.fn(),
            aggregate: vi.fn(),
          },
        },
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);

    vi.resetAllMocks();

    const companyQuery = prismaMock.client.orm.public.Company;
    const contactQuery = prismaMock.client.orm.public.Contact;
    const taskQuery = prismaMock.client.orm.public.Task;
    const dealQuery = prismaMock.client.orm.public.Deal;

    companyQuery.where.mockReturnValue(companyQuery);
    contactQuery.where.mockReturnValue(contactQuery);

    taskQuery.where.mockReturnValue(taskQuery);
    taskQuery.groupBy.mockReturnValue(taskQuery);

    dealQuery.where.mockReturnValue(dealQuery);
    dealQuery.groupBy.mockReturnValue(dealQuery);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --------------------------------------------------
  // getStats
  // --------------------------------------------------

  it('should return overall statistics', async () => {
    prismaMock.client.orm.public.Company.aggregate.mockResolvedValue({
      total: 5,
    });

    prismaMock.client.orm.public.Contact.aggregate.mockResolvedValue({
      total: 8,
    });

    prismaMock.client.orm.public.Task.aggregate
      .mockResolvedValueOnce({
        total: 10,
      })
      .mockResolvedValueOnce({
        total: 10,
      });

    prismaMock.client.orm.public.Task.groupBy.mockReturnValue({
      aggregate: vi.fn().mockResolvedValue([
        { status: 'TODO', count: 4 },
        { status: 'IN_PROGRESS', count: 3 },
        { status: 'DONE', count: 3 },
      ]),
    });

    prismaMock.client.orm.public.Deal.aggregate
      .mockResolvedValueOnce({
        total: 6,
      })
      .mockResolvedValueOnce({
        total: 6,
      });

    prismaMock.client.orm.public.Deal.groupBy.mockReturnValue({
      aggregate: vi.fn().mockResolvedValue([
        { status: 'LEAD', count: 2 },
        { status: 'WON', count: 3 },
        { status: 'LOST', count: 1 },
      ]),
    });

    const result = await service.getStats({});

    expect(result).toEqual({
      companies: 5,
      contacts: 8,
      tasks: {
        total: 10,
        todo: 4,
        inProgress: 3,
        done: 3,
      },
      deals: {
        total: 6,
        open: 2,
        won: 3,
        lost: 1,
      },
    });
  });

  it('should apply the from date to all statistics queries', async () => {
    prismaMock.client.orm.public.Company.aggregate.mockResolvedValue({
      total: 0,
    });

    prismaMock.client.orm.public.Contact.aggregate.mockResolvedValue({
      total: 0,
    });

    prismaMock.client.orm.public.Task.aggregate
      .mockResolvedValueOnce({ total: 0 })
      .mockResolvedValueOnce({ total: 0 });

    prismaMock.client.orm.public.Deal.aggregate
      .mockResolvedValueOnce({ total: 0 })
      .mockResolvedValueOnce({ total: 0 });

    prismaMock.client.orm.public.Task.groupBy.mockReturnValue({
      aggregate: vi.fn().mockResolvedValue([]),
    });

    prismaMock.client.orm.public.Deal.groupBy.mockReturnValue({
      aggregate: vi.fn().mockResolvedValue([]),
    });

    await service.getStats({
      from: '2026-09-01',
    });

    expect(
      prismaMock.client.orm.public.Company.where,
    ).toHaveBeenCalledWith(expect.any(Function));

    expect(
      prismaMock.client.orm.public.Contact.where,
    ).toHaveBeenCalledWith(expect.any(Function));

    expect(
      prismaMock.client.orm.public.Task.where,
    ).toHaveBeenCalledWith(expect.any(Function));

    expect(
      prismaMock.client.orm.public.Deal.where,
    ).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should apply the to date to all statistics queries', async () => {
    prismaMock.client.orm.public.Company.aggregate.mockResolvedValue({
      total: 0,
    });

    prismaMock.client.orm.public.Contact.aggregate.mockResolvedValue({
      total: 0,
    });

    prismaMock.client.orm.public.Task.aggregate
      .mockResolvedValueOnce({ total: 0 })
      .mockResolvedValueOnce({ total: 0 });

    prismaMock.client.orm.public.Deal.aggregate
      .mockResolvedValueOnce({ total: 0 })
      .mockResolvedValueOnce({ total: 0 });

    prismaMock.client.orm.public.Task.groupBy.mockReturnValue({
      aggregate: vi.fn().mockResolvedValue([]),
    });

    prismaMock.client.orm.public.Deal.groupBy.mockReturnValue({
      aggregate: vi.fn().mockResolvedValue([]),
    });

    await service.getStats({
      to: '2026-09-30',
    });

    expect(
      prismaMock.client.orm.public.Company.where,
    ).toHaveBeenCalledWith(expect.any(Function));

    expect(
      prismaMock.client.orm.public.Contact.where,
    ).toHaveBeenCalledWith(expect.any(Function));

    expect(
      prismaMock.client.orm.public.Task.where,
    ).toHaveBeenCalledWith(expect.any(Function));

    expect(
      prismaMock.client.orm.public.Deal.where,
    ).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should count all non-WON and non-LOST deals as open', async () => {
    prismaMock.client.orm.public.Company.aggregate.mockResolvedValue({
      total: 0,
    });

    prismaMock.client.orm.public.Contact.aggregate.mockResolvedValue({
      total: 0,
    });

    prismaMock.client.orm.public.Task.aggregate
      .mockResolvedValueOnce({ total: 0 })
      .mockResolvedValueOnce({ total: 0 });

    prismaMock.client.orm.public.Deal.aggregate
      .mockResolvedValueOnce({ total: 5 })
      .mockResolvedValueOnce({ total: 5 });

    prismaMock.client.orm.public.Task.groupBy.mockReturnValue({
      aggregate: vi.fn().mockResolvedValue([]),
    });

    prismaMock.client.orm.public.Deal.groupBy.mockReturnValue({
      aggregate: vi.fn().mockResolvedValue([
        { status: 'LEAD', count: 2 },
        { status: 'CONTACTED', count: 1 },
        { status: 'PROPOSAL', count: 1 },
        { status: 'WON', count: 1 },
      ]),
    });

    const result = await service.getStats({});

    expect(result.deals).toEqual({
      total: 5,
      open: 4,
      won: 1,
      lost: 0,
    });
  });

  // --------------------------------------------------
  // getStatsDeals
  // --------------------------------------------------

  it('should return deal statistics with total value', async () => {
    prismaMock.client.orm.public.Deal.aggregate
      .mockResolvedValueOnce({
        total: 5,
        totalValue: '1250.50',
      });

    prismaMock.client.orm.public.Deal.groupBy.mockReturnValue({
      aggregate: vi.fn().mockResolvedValue([
        {
          status: 'LEAD',
          count: 2,
          value: '500',
        },
        {
          status: 'WON',
          count: 2,
          value: '600.50',
        },
        {
          status: 'LOST',
          count: 1,
          value: '150',
        },
      ]),
    });

    const result = await service.getStatsDeals({});

    expect(result).toEqual({
      totalDeals: 5,
      totalValue: '1250.50',
      byStatus: [
        {
          status: 'LEAD',
          count: 2,
          value: '500',
        },
        {
          status: 'WON',
          count: 2,
          value: '600.50',
        },
        {
          status: 'LOST',
          count: 1,
          value: '150',
        },
      ],
    });
  });

  it('should return zero when total deal value is null', async () => {
    prismaMock.client.orm.public.Deal.aggregate.mockResolvedValueOnce({
      total: 0,
      totalValue: null,
    });

    prismaMock.client.orm.public.Deal.groupBy.mockReturnValue({
      aggregate: vi.fn().mockResolvedValue([]),
    });

    const result = await service.getStatsDeals({});

    expect(result).toEqual({
      totalDeals: 0,
      totalValue: '0',
      byStatus: [],
    });
  });

  it('should convert null status values to zero', async () => {
    prismaMock.client.orm.public.Deal.aggregate.mockResolvedValueOnce({
      total: 1,
      totalValue: '100',
    });

    prismaMock.client.orm.public.Deal.groupBy.mockReturnValue({
      aggregate: vi.fn().mockResolvedValue([
        {
          status: 'WON',
          count: 1,
          value: null,
        },
      ]),
    });

    const result = await service.getStatsDeals({});

    expect(result.byStatus).toEqual([
      {
        status: 'WON',
        count: 1,
        value: '0',
      },
    ]);
  });

  it('should apply date filters to deal statistics', async () => {
    prismaMock.client.orm.public.Deal.aggregate.mockResolvedValueOnce({
      total: 0,
      totalValue: null,
    });

    prismaMock.client.orm.public.Deal.groupBy.mockReturnValue({
      aggregate: vi.fn().mockResolvedValue([]),
    });

    await service.getStatsDeals({
      from: '2026-09-01',
      to: '2026-09-30',
    });

    expect(
      prismaMock.client.orm.public.Deal.where,
    ).toHaveBeenCalledTimes(2);

    expect(
      prismaMock.client.orm.public.Deal.where,
    ).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
    );

    expect(
      prismaMock.client.orm.public.Deal.where,
    ).toHaveBeenNthCalledWith(
      2,
      expect.any(Function),
    );
  });
});
