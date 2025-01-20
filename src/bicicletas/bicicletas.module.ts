import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { BicicletasService } from './bicicletas.service';
import { BicicletasController } from './bicicletas.controller';
import { TrancasModule } from 'src/trancas/trancas.module';
import { TypeormBicicletaRepository } from './infra/persistence/repositories/typeorm-bicicleta.repository';
import { TypeormTrancaRepository } from 'src/trancas/infra/persistence/repositories/typeorm-tranca.repository';
import { TypeormBicicletaEntity } from './infra/persistence/entities/typeorm-bicicleta.entity';
import { TypeormTrancaEntity } from 'src/trancas/infra/persistence/entities/typeorm-tranca.entity';
import { ExternoService } from 'src/common/utils/externo.service';
import { AluguelService } from 'src/common/utils/aluguel.service';

// Provedores de Repositórios
const repositoryProviders = [
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
];

@Module({
  imports: [TrancasModule, ConfigModule], // Configuração de dependências externas
  providers: [
    BicicletasService,
    ExternoService,
    AluguelService,
    ...repositoryProviders,
  ],
  controllers: [BicicletasController],
  exports: ['BicicletaRepository', 'TrancaRepository'],
})
export class BicicletasModule {}
