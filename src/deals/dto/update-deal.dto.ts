import { DealStatus } from './create-deal.dto.js';

export class UpdateDealDto {
    title?: string;
    value?: string;
    status?: DealStatus;
}