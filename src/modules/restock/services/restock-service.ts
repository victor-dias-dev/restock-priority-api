import { Inject, Injectable } from '@nestjs/common';
import { calculateRestockPriorities, PriorityResult } from 'restock-priority';
import { IPartsRepository, PARTS_REPOSITORY } from '../../parts/interfaces/parts-interface';

@Injectable()
export class RestockService {
  constructor(
    @Inject(PARTS_REPOSITORY)
    private readonly partsRepository: IPartsRepository,
  ) {}

  async getPriorities(): Promise<{ priorities: PriorityResult[] }> {
    const parts = await this.partsRepository.findAllUnpaged();
    const priorities = calculateRestockPriorities(parts);
    return { priorities };
  }
}
