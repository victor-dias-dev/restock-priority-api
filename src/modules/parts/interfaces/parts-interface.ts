import { Part } from '../domain/part-entity';
import { CreatePartDto } from '../dto/create-part-dto';
import { UpdatePartDto } from '../dto/update-part-dto';

export const PARTS_REPOSITORY = 'PARTS_REPOSITORY';

export interface IPartsRepository {
  create(data: CreatePartDto): Promise<Part>;
  findAll(category?: string): Promise<Part[]>;
  findById(id: string): Promise<Part | null>;
  update(id: string, data: UpdatePartDto): Promise<Part>;
  delete(id: string): Promise<void>;
}
