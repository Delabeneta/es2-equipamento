import { Module } from '@nestjs/common';
import { TotemService } from './totem.service';
import { DataSource } from 'typeorm';
import { TotemController } from './totem.controller';
import { TypeormTotemRepository } from './infra/persistence/repositories/typeorm-totem.repository';
import { TotemEntity } from './infra/persistence/entities/totem.entity';

@Module({
  controllers: [TotemController],
  providers: [
    TotemService,
    {
      provide: 'TotemRepository',
      inject: [DataSource],
      useFactory: (dataSource: DataSource) => {
        return new TypeormTotemRepository(
          dataSource.getRepository(TotemEntity),
        );
      },
    },
  ],
})
export class TotemModule {}
