import { Module } from '@nestjs/common';
import { BicicletasService } from './bicicletas.service';
import { BicicletasController } from './bicicletas.controller';
import { DataSource } from 'typeorm';
import { TypeormBicicletaRepository } from './infra/persistence/repositories/typeorm-bicicleta.repository';
import { TrancasModule } from 'src/trancas/trancas.module';
import { TypeormTrancaRepository } from 'src/trancas/infra/persistence/repositories/typeorm-tranca.repository';
import { TypeormBicicletaEntity } from './infra/persistence/entities/typeorm-bicicleta.entity';
import { TypeormTrancaEntity } from 'src/trancas/infra/persistence/entities/typeorm-tranca.entity';

@Module({
  imports: [TrancasModule],
  providers: [
    BicicletasService,
    {
      provide: 'BicicletaRepository',
      inject: [DataSource],
      useFactory: (dataSource: DataSource) => {
        return new TypeormBicicletaRepository(
          dataSource.getRepository(TypeormBicicletaEntity),
        );
      },
    },
    {
      provide: 'TrancaRepository',
      inject: [DataSource],
      useFactory: (dataSource: DataSource) => {
        return new TypeormTrancaRepository(
          dataSource.getRepository(TypeormTrancaEntity),
        );
      },
    },
  ],
  controllers: [BicicletasController],
})
export class BicicletasModule {}
