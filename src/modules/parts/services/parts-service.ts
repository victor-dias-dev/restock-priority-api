import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IPartsRepository,
  ListPartsQuery,
  PaginatedParts,
  PARTS_REPOSITORY,
} from '../interfaces/parts-interface';
import { Part } from '../domain/part-entity';
import { CreatePartDto } from '../dto/create-part-dto';
import { UpdatePartDto } from '../dto/update-part-dto';

@Injectable()
export class PartsService {
  constructor(
    @Inject(PARTS_REPOSITORY)
    private readonly partsRepository: IPartsRepository,
  ) {}

  async create(dto: CreatePartDto): Promise<Part> {
    return this.partsRepository.create(dto);
  }

  async findAll(query: ListPartsQuery): Promise<PaginatedParts> {
    return this.partsRepository.findAll(query);
  }

  async findById(id: string): Promise<Part> {
    const part = await this.partsRepository.findById(id);
    if (!part) {
      throw new NotFoundException(`Part with id "${id}" not found`);
    }
    return part;
  }

  async update(id: string, dto: UpdatePartDto): Promise<Part> {
    await this.findById(id);
    return this.partsRepository.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    return this.partsRepository.delete(id);
  }
}
