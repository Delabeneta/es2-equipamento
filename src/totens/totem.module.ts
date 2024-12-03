import { Module } from '@nestjs/common';
import { TotemService } from './totem.service';
import { DataSource } from 'typeorm';
import { TotemController } from './totem.controller';
import { TypeormTotemRepository } from './infra/persistence/repositories/typeorm-totem.repository';
import { TypeormTotemEntity } from './infra/persistence/entities/typeorm-totem.entity';

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
  ],
})
export class TotemModule {}
