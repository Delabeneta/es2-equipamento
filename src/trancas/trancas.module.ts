import { Module } from '@nestjs/common';
import { TrancasService } from './trancas.service';
import { TrancasController } from './trancas.controller';
import { TypeormTrancaRepository } from '../trancas/infra/persistence/repositories/typeorm-tranca.repository';
import { DataSource } from 'typeorm';
import { TypeormTrancaEntity } from './infra/persistence/entities/typeorm-tranca.entity';
import { TypeormTotemRepository } from 'src/totens/infra/persistence/repositories/typeorm-totem.repository';
import { TypeormTotemEntity } from 'src/totens/infra/persistence/entities/typeorm-totem.entity';
import { TypeormBicicletaRepository } from 'src/bicicletas/infra/persistence/repositories/typeorm-bicicleta.repository';
import { TypeormBicicletaEntity } from 'src/bicicletas/infra/persistence/entities/typeorm-bicicleta.entity';
import { ConfigModule } from '@nestjs/config';
import { ExternoService } from 'src/common/utils/externo.service';
import { AluguelService } from 'src/common/utils/aluguel.service';

@Module({
  imports: [ConfigModule], // Importa ConfigModule para acessar variáveis de ambiente
  controllers: [TrancasController],
  providers: [
    TrancasService,
    ExternoService,
    AluguelService,
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
  exports: ['TrancaRepository', 'TotemRepository', 'BicicletaRepository'],
})
export class TrancasModule {}
