/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from '../app/app.controller';
import { AppService } from '../app/app.service';
import { config } from '../ormconfig';
import { BicicletasModule } from 'src/bicicletas/bicicletas.module';

@Module({
  imports: [BicicletasModule, TypeOrmModule.forRoot(config)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}