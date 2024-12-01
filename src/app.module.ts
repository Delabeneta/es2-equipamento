import { Module } from '@nestjs/common';
import { BicicletasModule } from 'src/bicicletas/bicicletas.module';
import { DatabaseModule } from './database/database.module';
import { TrancasModule } from './trancas/trancas.module';
import { TotemModule } from './totens/totem.module';

@Module({
  imports: [DatabaseModule, BicicletasModule, TrancasModule, TotemModule],
})
export class AppModule {}
