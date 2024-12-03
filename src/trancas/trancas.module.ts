import { Module } from '@nestjs/common';
import { TrancasService } from './trancas.service';
import { TrancasController } from './trancas.controller';
import { TypeormTrancaRepository } from '../trancas/infra/persistence/repositories/typeorm-tranca.repository';
import { DataSource } from 'typeorm';
import { TypeormTrancaEntity } from './infra/persistence/entities/typeorm-tranca.entity';
import { TotemModule } from 'src/totens/totem.module';
import { TypeormTotemEntity } from 'src/totens/infra/persistence/entities/typeorm-totem.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TypeormTotemEntity]), TotemModule],
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
  ],
})
export class TrancasModule {}
