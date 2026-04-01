import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { PartsService } from '../services/parts-service';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { CreatePartSchema, CreatePartDto } from '../dto/create-part-dto';
import { UpdatePartSchema, UpdatePartDto } from '../dto/update-part-dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  @ApiOperation({ summary: 'Adicionar peça' })
  @ApiBody({ schema: { type: 'object', properties: {
    name: { type: 'string' },
    category: { type: 'string' },
    currentStock: { type: 'number' },
    minimumStock: { type: 'number' },
    averageDailySales: { type: 'number' },
    leadTimeDays: { type: 'number' },
    unitCost: { type: 'number' },
    criticalityLevel: { type: 'number' } } } })
  @ApiResponse({ status: 201, description: 'Peça adicionada' })
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new (ZodValidationPipe(CreatePartSchema))())
  create(@Body() dto: CreatePartDto) {
    return this.partsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar peças' })
  @ApiQuery({ name: 'category', required: false })
  @ApiResponse({ status: 200, description: 'Lista de peças' })
  findAll(@Query('category') category?: string) {
    return this.partsService.findAll(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar peça por ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Peça encontrada' })
  findById(@Param('id') id: string) {
    return this.partsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar peça' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        category: { type: 'string' },
        currentStock: { type: 'number' },
        minimumStock: { type: 'number' },
        averageDailySales: { type: 'number' },
        leadTimeDays: { type: 'number' },
        unitCost: { type: 'number' },
        criticalityLevel: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Peça atualizada' })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body(new (ZodValidationPipe(UpdatePartSchema))()) dto: UpdatePartDto,
  ) {
    return this.partsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover peça' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Peça removida' })
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string) {
    return this.partsService.delete(id);
  }
}
