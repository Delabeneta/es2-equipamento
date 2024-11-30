import { Module } from '@nestjs/common';
import { BicicletasModule } from 'src/bicicletas/bicicletas.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, BicicletasModule],
  controllers: [],
})
export class AppModule {}
