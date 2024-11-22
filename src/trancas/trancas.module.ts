/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrancasService } from './trancas.service';
import { TrancasController } from './trancas.controller';
import { Tranca } from './entities/tranca.entity';
 
@Module({
  imports: [TypeOrmModule.forFeature([Tranca])], // conf do typeorm para incluir entidade funcionario
  controllers: [TrancasController],
  providers: [TrancasService],
})
export class TrancasModule {}
