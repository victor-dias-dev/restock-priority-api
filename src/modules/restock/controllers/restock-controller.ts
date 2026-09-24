import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RestockService } from '../services/restock-service';

@Controller('restock')
export class RestockController {
  constructor(private readonly restockService: RestockService) {}

  @Get('priorities')
  @ApiOperation({ summary: 'List replenishment priorities' })
  @ApiResponse({ status: 200, description: 'Replenishment priorities' })
  getPriorities() {
    return this.restockService.getPriorities();
  }
}
