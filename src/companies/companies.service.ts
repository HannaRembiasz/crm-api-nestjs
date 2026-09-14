import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CompaniesService {
    constructor(private prisma: PrismaService) {}
    getAllCompanies() {
        return this.prisma.client.orm.public.Company.all();
    }
}
