import { Module } from '@nestjs/common';
import { TrancasService } from './trancas.service';
import { TrancasController } from './trancas.controller';
import { TrancaEntity } from '../trancas/infra/persistence/entities/tranca.entity';
import { TypeormTrancaRepository } from '../trancas/infra/persistence/repositories/typeorm-tranca.repository';
import { DataSource } from 'typeorm';

@Module({
  controllers: [TrancasController],
  providers: [
    TrancasService,
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
})
export class TrancasModule {}
