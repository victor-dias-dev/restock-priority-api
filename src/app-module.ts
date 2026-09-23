import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PartsModule } from './modules/parts/parts-module';
import { RestockModule } from './modules/restock/restock-module';
import { HealthModule } from './modules/health/health-module';

@Module({
  imports: [PrismaModule, PartsModule, RestockModule, HealthModule],
})
export class AppModule {}
