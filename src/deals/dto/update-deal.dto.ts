import { DealStatus } from './create-deal.dto.js';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class UpdateDealDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    title?: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    value?: string;

    @IsEnum(DealStatus)
    @IsOptional()
    @IsNotEmpty()
    status?: DealStatus;
}