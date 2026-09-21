import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { StatsOverview, StatsDeals } from './stats.types.js';
import type { StatsQueryDto } from './dto/stats-query.dto.js';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStats(query: StatsQueryDto): Promise<StatsOverview> {
    let companies = this.prisma.client.orm.public.Company;
    let contacts = this.prisma.client.orm.public.Contact;
    let tasks = this.prisma.client.orm.public.Task;
    let deals = this.prisma.client.orm.public.Deal;

    if (query.from) {
      const from = query.from;
      companies = companies.where((company) => company.createdAt.gte(from));
      contacts = contacts.where((contact) => contact.createdAt.gte(from));
      deals = deals.where((deal) => deal.createdAt.gte(from));
      tasks = tasks.where((task) => task.createdAt.gte(from));
    }

    if (query.to) {
      const to = new Date(query.to);
      to.setUTCDate(to.getUTCDate() + 1);

      companies = companies.where((company) =>
        company.createdAt.lt(to.toISOString()),
      );
      contacts = contacts.where((contact) =>
        contact.createdAt.lt(to.toISOString()),
      );
      deals = deals.where((deal) => deal.createdAt.lt(to.toISOString()));
      tasks = tasks.where((task) => task.createdAt.lt(to.toISOString()));
    }

    const companyStats = await companies.aggregate((agg) => ({
      total: agg.count(),
    }));

    const contactStats = await contacts.aggregate((agg) => ({
      total: agg.count(),
    }));

    const taskStats = await tasks.groupBy('status').aggregate((agg) => ({
      count: agg.count(),
    }));

    const dealStats = await deals.groupBy('status').aggregate((agg) => ({
      count: agg.count(),
    }));

    const taskTotal = await tasks.aggregate((agg) => ({
      total: agg.count(),
    }));

    const dealTotal = await deals.aggregate((agg) => ({
      total: agg.count(),
    }));

    const taskCounts = {
      todo: 0,
      inProgress: 0,
      done: 0,
    };

    for (const item of taskStats) {
      if (item.status === 'TODO') taskCounts.todo = item.count;
      if (item.status === 'IN_PROGRESS') taskCounts.inProgress = item.count;
      if (item.status === 'DONE') taskCounts.done = item.count;
    }

    const dealCounts = {
      open: 0,
      won: 0,
      lost: 0,
    };

    for (const item of dealStats) {
      if (item.status === 'WON') dealCounts.won = item.count;
      else if (item.status === 'LOST') dealCounts.lost = item.count;
      else dealCounts.open += item.count;
    }

    return {
      companies: companyStats.total,
      contacts: contactStats.total,
      tasks: {
        total: taskTotal.total,
        ...taskCounts,
      },
      deals: {
        total: dealTotal.total,
        ...dealCounts,
      },
    };
  }

  async getStatsDeals(query: StatsQueryDto): Promise<StatsDeals> {
    let deals = this.prisma.client.orm.public.Deal;

    if (query.from) {
      const from = query.from;
      deals = deals.where((deal) => deal.createdAt.gte(from));
    }

    if (query.to) {
      const to = new Date(query.to);
      to.setUTCDate(to.getUTCDate() + 1);

      deals = deals.where((deal) => deal.createdAt.lt(to.toISOString()));
    }

    const totalDeals = await deals.aggregate((agg) => ({
      total: agg.count(),
      totalValue: agg.sum('value'),
    }));

    const byStatus = await deals.groupBy('status').aggregate((agg) => ({
      count: agg.count(),
      value: agg.sum('value'),
    }));

    return {
      totalDeals: totalDeals.total,
      totalValue:
        totalDeals.totalValue === null ? '0' : String(totalDeals.totalValue),
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item.count,
        value: item.value === null ? '0' : String(item.value),
      })),
    };
  }
}
