import { Injectable } from '@nestjs/common';
import { Part as PrismaPart } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { IPartsRepository, ListPartsQuery, PaginatedParts } from '../interfaces/parts-interface';
import { Part } from '../domain/part-entity';
import { CreatePartDto } from '../dto/create-part-dto';
import { UpdatePartDto } from '../dto/update-part-dto';

function toPart(record: PrismaPart): Part {
  return {
    id: record.id,
    name: record.name,
    category: record.category,
    currentStock: record.currentStock,
    minimumStock: record.minimumStock,
    averageDailySales: record.averageDailySales,
    leadTimeDays: record.leadTimeDays,
    unitCost: record.unitCost,
    criticalityLevel: record.criticalityLevel,
  };
}

@Injectable()
export class PrismaPartsRepository implements IPartsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePartDto): Promise<Part> {
    const record = await this.prisma.part.create({ data });
    return toPart(record);
  }

  async findAll(query: ListPartsQuery): Promise<PaginatedParts> {
    const where = query.category ? { category: query.category } : undefined;
    const skip = (query.page - 1) * query.limit;
    const [records, total] = await this.prisma.$transaction([
      this.prisma.part.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: query.limit,
      }),
      this.prisma.part.count({ where }),
    ]);

    return {
      items: records.map(toPart),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async findAllUnpaged(): Promise<Part[]> {
    const records = await this.prisma.part.findMany({ orderBy: { name: 'asc' } });
    return records.map(toPart);
  }

  async findById(id: string): Promise<Part | null> {
    const record = await this.prisma.part.findUnique({ where: { id } });
    return record ? toPart(record) : null;
  }

  async update(id: string, data: UpdatePartDto): Promise<Part> {
    const record = await this.prisma.part.update({ where: { id }, data });
    return toPart(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.part.delete({ where: { id } });
  }
}
