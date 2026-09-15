export enum DealStatus {
    LEAD = 'LEAD',
    CONTACTED = 'CONTACTED',
    PROPOSAL = 'PROPOSAL',
    NEGOTIATION = 'NEGOTIATION',
    WON = 'WON',
    LOST = 'LOST',
}

export class CreateDealDto {
    title: string;
    value?: string;
    status: DealStatus;
    companyId: number;
    assignedToId: number;
}