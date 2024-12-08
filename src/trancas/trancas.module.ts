import { Module } from '@nestjs/common';
import { TrancasService } from './trancas.service';
import { TrancasController } from './trancas.controller';
import { TypeormTrancaRepository } from '../trancas/infra/persistence/repositories/typeorm-tranca.repository';
import { DataSource } from 'typeorm';
import { TypeormTrancaEntity } from './infra/persistence/entities/typeorm-tranca.entity';
import { TypeormTotemRepository } from 'src/totens/infra/persistence/repositories/typeorm-totem.repository';
import { TypeormTotemEntity } from 'src/totens/infra/persistence/entities/typeorm-totem.entity';

@Module({
  controllers: [TrancasController],
  providers: [
    TrancasService,
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
      provide: 'TotemRepository',
      inject: [DataSource],
      useFactory: (dataSource: DataSource) => {
        return new TypeormTotemRepository(
          dataSource.getRepository(TypeormTotemEntity),
        );
      },
    },
  ],
})
export class TrancasModule {}
