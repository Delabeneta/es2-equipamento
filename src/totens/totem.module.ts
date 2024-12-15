import { Module } from '@nestjs/common';
import { TotemService } from './totem.service';
import { DataSource } from 'typeorm';
import { TotemController } from './totem.controller';
import { TypeormTotemRepository } from './infra/persistence/repositories/typeorm-totem.repository';
import { TypeormTotemEntity } from './infra/persistence/entities/typeorm-totem.entity';
import { TypeormTrancaRepository } from 'src/trancas/infra/persistence/repositories/typeorm-tranca.repository';
import { TypeormTrancaEntity } from 'src/trancas/infra/persistence/entities/typeorm-tranca.entity';
import { TypeormBicicletaEntity } from 'src/bicicletas/infra/persistence/entities/typeorm-bicicleta.entity';
import { TypeormBicicletaRepository } from 'src/bicicletas/infra/persistence/repositories/typeorm-bicicleta.repository';

@Module({
  controllers: [TotemController],
  providers: [
    TotemService,
    {
      provide: 'TotemRepository',
      inject: [DataSource],
      useFactory: (dataSource: DataSource) => {
        return new TypeormTotemRepository(
          dataSource.getRepository(TypeormTotemEntity),
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
    {
      provide: 'BicicletaRepository',
      inject: [DataSource],
      useFactory: (dataSource: DataSource) => {
        return new TypeormBicicletaRepository(
          dataSource.getRepository(TypeormBicicletaEntity),
        );
      },
    },
  ],
})
export class TotemModule {}
