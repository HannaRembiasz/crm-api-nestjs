import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator.js';
import { InternalMaintainGuard } from './internal.guard.js';
import { InternalMaintainService } from './internal.service.js';

@Controller('internal')
export class InternalController {
  constructor(private readonly internalMaintainService: InternalMaintainService) {}

  @ApiExcludeEndpoint()
  @Public()
  @UseGuards(InternalMaintainGuard)
  @Post('maintain-db')
  maintainDb() {
    return this.internalMaintainService.maintainDb();
  }
}