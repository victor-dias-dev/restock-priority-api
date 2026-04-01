import { Module } from '@nestjs/common';
import { RestockController } from './controllers/restock-controller';
import { RestockService } from './services/restock-service';
import { PartsModule } from '../parts/parts-module';

@Module({
  imports: [PartsModule],
  controllers: [RestockController],
  providers: [RestockService],
})
export class RestockModule {}
