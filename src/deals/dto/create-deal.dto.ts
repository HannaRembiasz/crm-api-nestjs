export enum DealStatus {
    LEAD = 'LEAD',
    CONTACTED = 'CONTACTED',
    PROPOSAL = 'PROPOSAL',
    NEGOTIATION = 'NEGOTIATION',
    WON = 'WON',
    LOST = 'LOST',
}

import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt } from 'class-validator';
export class CreateDealDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    value?: string;

    @IsEnum(DealStatus)
    @IsNotEmpty()
    status: DealStatus;

    @IsInt()
    @IsNotEmpty()
    companyId: number;

    @IsInt()
    @IsNotEmpty()
    assignedToId: number;
}