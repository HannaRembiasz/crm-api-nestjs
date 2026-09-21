import { DealStatus } from '../deals/dto/create-deal.dto.js';
type DealStatusValue = `${DealStatus}`;

export type StatsOverview = {
  companies: number;
  contacts: number;
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  };
  deals: {
    total: number;
    open: number;
    won: number;
    lost: number;
  };
};

export type StatsDeals = {
  totalDeals: number;
  totalValue: string;
  byStatus: {
    status: DealStatusValue;
    count: number;
    value: string;
  }[];
};