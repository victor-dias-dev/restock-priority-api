import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IPartsRepository } from '../interfaces/parts-interface';
import { Part } from '../domain/part-entity';
import { CreatePartDto } from '../dto/create-part-dto';
import { UpdatePartDto } from '../dto/update-part-dto';

@Injectable()
export class PrismaPartsRepository implements IPartsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePartDto): Promise<Part> {
    return this.prisma.part.create({ data: {
      ...data,
      criticalityLevel: data.criticalityLevel || 1,
    } as Part });
  }

  async findAll(category?: string): Promise<Part[]> {
    return this.prisma.part.findMany({
      where: category ? { category } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Part | null> {
    return this.prisma.part.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdatePartDto): Promise<Part> {
    return this.prisma.part.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.part.delete({ where: { id } });
  }
}
