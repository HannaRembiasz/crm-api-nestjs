import { DealStatus } from './create-deal.dto.js';

export class DealQueryDto {
    title?: string;
    status?: DealStatus;
    companyId?: number;
    assignedToId?: number;
}