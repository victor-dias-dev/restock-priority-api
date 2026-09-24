import { Part } from '../domain/part-entity';
import { CreatePartDto } from '../dto/create-part-dto';
import { UpdatePartDto } from '../dto/update-part-dto';

export const PARTS_REPOSITORY = 'PARTS_REPOSITORY';

export interface ListPartsQuery {
  category?: string;
  page: number;
  limit: number;
}

export interface PaginatedParts {
  items: Part[];
  page: number;
  limit: number;
  total: number;
}

export interface IPartsRepository {
  create(data: CreatePartDto): Promise<Part>;
  findAll(query: ListPartsQuery): Promise<PaginatedParts>;
  findAllUnpaged(): Promise<Part[]>;
  findById(id: string): Promise<Part | null>;
  update(id: string, data: UpdatePartDto): Promise<Part>;
  delete(id: string): Promise<void>;
}
