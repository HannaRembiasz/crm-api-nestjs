import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { TASK_DESCRIPTIONS, TASK_TITLES } from './data/tasks-data.js';
import { DEAL_TITLES } from './data/deals-data.js';
import { CONTACT_NOTES } from './data/contacts-data.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { COMPANY_NOTES } from './data/companies-data.js';

type MaintainSummary = {
  companiesCreated: number;
  contactsCreated: number;
  employeesCreated: number;
  tasksCreated: number;
  dealsCreated: number;
};

const TARGETS = {
  companies: 30,
  contacts: 100,
  employees: 10, // non-protected only
  tasks: 50,
  deals: 40,
} as const;

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;
const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
const DEAL_STATUSES = [
  'LEAD',
  'CONTACTED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
] as const;

@Injectable()
export class InternalMaintainService {
  private readonly logger = new Logger(InternalMaintainService.name);

  constructor(private readonly prisma: PrismaService) {}

  async maintainDb(): Promise<MaintainSummary> {
    const companiesCreated = await this.topUpCompanies();
    const employeesCreated = await this.topUpEmployees();
    const contactsCreated = await this.topUpContacts();
    const tasksCreated = await this.topUpTasks();
    const dealsCreated = await this.topUpDeals();

    return {
      companiesCreated,
      contactsCreated,
      employeesCreated,
      tasksCreated,
      dealsCreated,
    };
  }

  private async topUpCompanies(): Promise<number> {
    const before = await this.countCompanies();
    const gap = Math.max(TARGETS.companies - before, 0);
    this.logger.log(
      `Companies before=${before}, target=${TARGETS.companies}, create=${gap}`,
    );

    for (let i = 0; i < gap; i += 1) {
      const name = faker.company.name();

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      await this.prisma.client.orm.public.Company.create({
        name,
        email: `contact@${slug}.com`,
        phone: faker.string.numeric(9),
        website: `https://${slug}.com`,
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        postalCode: faker.location.zipCode(),
        country: faker.location.country(),
        notes: faker.helpers.arrayElement(COMPANY_NOTES),
      });
    }

    const after = await this.countCompanies();
    this.logger.log(`Companies after=${after}`);

    return gap;
  }

  private async topUpEmployees(): Promise<number> {
    const before = await this.countNonProtectedEmployees();
    const gap = Math.max(TARGETS.employees - before, 0);
    this.logger.log(
      `Non-protected employees before=${before}, target=${TARGETS.employees}, create=${gap}`,
    );

    if (gap === 0) {
      this.logger.log(`Non-protected employees after=${before}`);
      return 0;
    }

    const hashedPassword = await bcrypt.hash('ChangeMe123!', 10);

    for (let i = 0; i < gap; i += 1) {
      const first = faker.person.firstName();
      const last = faker.person.lastName();
      const email = `employee.${first.toLowerCase()}.${last.toLowerCase()}.${faker.string.numeric(4).toLowerCase()}@mail.com`;

      await this.prisma.client.orm.public.User.create({
        email,
        password: hashedPassword,
        name: `${first} ${last}`,
        role: 'EMPLOYEE',
        isProtected: false,
      });
    }

    const after = await this.countNonProtectedEmployees();
    this.logger.log(`Non-protected employees after=${after}`);

    return gap;
  }

  private async topUpContacts(): Promise<number> {
    const before = await this.countContacts();
    const gap = Math.max(TARGETS.contacts - before, 0);
    this.logger.log(
      `Contacts before=${before}, target=${TARGETS.contacts}, create=${gap}`,
    );

    if (gap === 0) {
      this.logger.log(`Contacts after=${before}`);
      return 0;
    }

    const companyIds = await this.getCompanyIds();

    for (let i = 0; i < gap; i += 1) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      await this.prisma.client.orm.public.Contact.create({
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        phone: faker.string.numeric(9),
        jobTitle: faker.person.jobTitle(),
        notes: faker.helpers.arrayElement(CONTACT_NOTES),
        companyId: faker.helpers.arrayElement(companyIds),
      });
    }

    const after = await this.countContacts();
    this.logger.log(`Contacts after=${after}`);

    return gap;
  }

  private async topUpTasks(): Promise<number> {
    const before = await this.countTasks();
    const gap = Math.max(TARGETS.tasks - before, 0);
    this.logger.log(
      `Tasks before=${before}, target=${TARGETS.tasks}, create=${gap}`,
    );

    if (gap === 0) {
      this.logger.log(`Tasks after=${before}`);
      return 0;
    }

    const userIds = await this.getAllUserIds();
    const companyIds = await this.getCompanyIds();

    for (let i = 0; i < gap; i += 1) {
      await this.prisma.client.orm.public.Task.create({
        title: faker.helpers.arrayElement(TASK_TITLES),
        description: faker.helpers.arrayElement(TASK_DESCRIPTIONS),
        status: faker.helpers.arrayElement(TASK_STATUSES),
        priority: faker.helpers.arrayElement(TASK_PRIORITIES),
        dueDate: faker.date.soon({ days: 90 }).toISOString(),
        assignedToId: faker.helpers.arrayElement(userIds),
        companyId:
          Math.random() < 0.8 ? faker.helpers.arrayElement(companyIds) : null,
      });
    }

    const after = await this.countTasks();
    this.logger.log(`Tasks after=${after}`);

    return gap;
  }

  private async topUpDeals(): Promise<number> {
    const before = await this.countDeals();
    const gap = Math.max(TARGETS.deals - before, 0);
    this.logger.log(
      `Deals before=${before}, target=${TARGETS.deals}, create=${gap}`,
    );

    if (gap === 0) {
      this.logger.log(`Deals after=${before}`);
      return 0;
    }

    const userIds = await this.getAllUserIds();
    const companyIds = await this.getCompanyIds();

    for (let i = 0; i < gap; i += 1) {
      await this.prisma.client.orm.public.Deal.create({
        title: faker.helpers.arrayElement(DEAL_TITLES),
        value: faker.finance.amount({ min: 500, max: 75000, dec: 2 }),
        status: faker.helpers.arrayElement(DEAL_STATUSES),
        companyId: faker.helpers.arrayElement(companyIds),
        assignedToId: faker.helpers.arrayElement(userIds),
      });
    }

    const after = await this.countDeals();
    this.logger.log(`Deals after=${after}`);

    return gap;
  }

  private async countCompanies(): Promise<number> {
    const result = await this.prisma.client.orm.public.Company.aggregate(
      (agg) => ({
        total: agg.count(),
      }),
    );
    return result.total;
  }

  private async countContacts(): Promise<number> {
    const result = await this.prisma.client.orm.public.Contact.aggregate(
      (agg) => ({
        total: agg.count(),
      }),
    );
    return result.total;
  }

  private async countTasks(): Promise<number> {
    const result = await this.prisma.client.orm.public.Task.aggregate(
      (agg) => ({
        total: agg.count(),
      }),
    );
    return result.total;
  }

  private async countDeals(): Promise<number> {
    const result = await this.prisma.client.orm.public.Deal.aggregate(
      (agg) => ({
        total: agg.count(),
      }),
    );
    return result.total;
  }

  private async countNonProtectedEmployees(): Promise<number> {
    const result = await this.prisma.client.orm.public.User.where({
      isProtected: false,
      role: 'EMPLOYEE',
    }).aggregate((agg) => ({
      total: agg.count(),
    }));

    return result.total;
  }

  private async getCompanyIds(): Promise<number[]> {
    const rows = await this.prisma.client.orm.public.Company.select('id').all();
    return rows.map((row) => row.id);
  }

  private async getAllUserIds(): Promise<number[]> {
    const rows = await this.prisma.client.orm.public.User.select('id').all();
    return rows.map((row) => row.id);
  }
}
