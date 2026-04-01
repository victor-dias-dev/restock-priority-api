import { Module } from '@nestjs/common';
import { PartsController } from './controllers/parts-controller';
import { PartsService } from './services/parts-service';
import { PrismaPartsRepository } from './repositories/parts-repository';
import { PARTS_REPOSITORY } from './interfaces/parts-interface';

@Module({
  controllers: [PartsController],
  providers: [
    PartsService,
    {
      provide: PARTS_REPOSITORY,
      useClass: PrismaPartsRepository,
    },
  ],
  exports: [PARTS_REPOSITORY],
})
export class PartsModule {}
