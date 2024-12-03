import { Module } from '@nestjs/common';
import { BicicletasService } from './bicicletas.service';
import { BicicletasController } from './bicicletas.controller';
import { BicicletaEntity } from './infra/persistence/entities/bicicleta.entity';
import { DataSource } from 'typeorm';
import { TypeormBicicletaRepository } from './infra/persistence/repositories/typeorm-bicicleta.repository';
import { TrancasModule } from 'src/trancas/trancas.module';
import { TypeormTrancaRepository } from 'src/trancas/infra/persistence/repositories/typeorm-tranca.repository';
import { TrancaEntity } from 'src/trancas/infra/persistence/entities/tranca.entity';

@Module({
  imports: [TrancasModule],
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
    {
      provide: 'TrancaRepository',
      inject: [DataSource],
      useFactory: (dataSource: DataSource) => {
        return new TypeormTrancaRepository(
          dataSource.getRepository(TrancaEntity),
        );
      },
    },
  ],
  controllers: [BicicletasController],
})
export class BicicletasModule {}
