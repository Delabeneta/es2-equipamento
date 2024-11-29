import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BicicletasService } from './bicicletas.service';
import { BicicletasController } from './bicicletas.controller';
import { Bicicleta } from './entities/bicicleta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bicicleta])], // conf do typeorm para incluir entidade funcionario
  providers: [BicicletasService],
  controllers: [BicicletasController]
})
export class BicicletasModule {}
