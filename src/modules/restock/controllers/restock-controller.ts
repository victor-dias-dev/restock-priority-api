import { Controller, Get } from '@nestjs/common';
import { RestockService } from '../services/restock-service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('restock')
export class RestockController {
  constructor(private readonly restockService: RestockService) {}

  @Get('priorities')
  @ApiOperation({ summary: 'Listar prioridades de reposição' })
  @ApiResponse({ status: 200, description: 'Lista de prioridades de reposição' })
  getPriorities() {
    return this.restockService.getPriorities();
  }
}
