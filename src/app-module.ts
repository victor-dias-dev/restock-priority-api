import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PartsModule } from './modules/parts/parts-module';
import { RestockModule } from './modules/restock/restock-module';

@Module({
  imports: [PrismaModule, PartsModule, RestockModule],
})
export class AppModule {}
