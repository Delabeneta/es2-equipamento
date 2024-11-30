import { Module } from '@nestjs/common';
import { BicicletasService } from './bicicletas.service';
import { BicicletasController } from './bicicletas.controller';
import { BicicletaEntity } from './entities/bicicleta.entity';
import { DataSource } from 'typeorm';
import { TypeormBicicletaRepository } from './infra/persistence/repositories/typeorm-bicicleta.repository';

@Module({
  providers: [
    BicicletasService,
    {
      provide: 'BicicletaRepository',
      inject: [DataSource],
      useFactory: (dataSource: DataSource) => {
        return new TypeormBicicletaRepository(
          dataSource.getRepository(BicicletaEntity),
        );
      },
    },
  ],
  controllers: [BicicletasController],
})
export class BicicletasModule {}
