import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PartsService } from '../services/parts-service';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { zodToOpenApiSchema } from '../../../common/openapi/zod-openapi';
import { CreatePartSchema, CreatePartDto } from '../dto/create-part-dto';
import { UpdatePartSchema, UpdatePartDto } from '../dto/update-part-dto';
import { ListPartsQuerySchema, ListPartsQueryDto } from '../dto/list-parts-query-dto';

@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a part' })
  @ApiBody({ schema: zodToOpenApiSchema(CreatePartSchema) })
  @ApiResponse({ status: 201, description: 'Part created' })
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new (ZodValidationPipe(CreatePartSchema))())
  create(@Body() dto: CreatePartDto) {
    return this.partsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List parts' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({
    name: 'page',
    required: false,
    schema: { type: 'integer', default: 1, minimum: 1 },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
  })
  @ApiResponse({ status: 200, description: 'Page of parts' })
  findAll(@Query(new (ZodValidationPipe(ListPartsQuerySchema))()) query: ListPartsQueryDto) {
    return this.partsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a part by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Part found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID' })
  @ApiResponse({ status: 404, description: 'Part not found' })
  findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.partsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a part' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ schema: zodToOpenApiSchema(UpdatePartSchema) })
  @ApiResponse({ status: 200, description: 'Part updated' })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new (ZodValidationPipe(UpdatePartSchema))()) dto: UpdatePartDto,
  ) {
    return this.partsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a part' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Part deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.partsService.delete(id);
  }
}
