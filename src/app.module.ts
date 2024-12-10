import { Module } from '@nestjs/common';
import { BicicletasModule } from 'src/bicicletas/bicicletas.module';
import { DatabaseModule } from './database/database.module';
import { TrancasModule } from './trancas/trancas.module';
import { TotemModule } from './totens/totem.module';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './common/utils/email.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    BicicletasModule,
    TrancasModule,
    TotemModule,
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class AppModule {}
