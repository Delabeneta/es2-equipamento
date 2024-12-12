import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Global()
@Module({
  providers: [
    {
      provide: DataSource,
      inject: [ConfigService],
      useFactory: async () => {
        const dataSource = new DataSource({
          type: 'sqlite',
          database: __dirname + '/../../db.sqlite',
          synchronize: true,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        });
        await dataSource.initialize();
        return dataSource;
      },
    },
  ],
  exports: [DataSource],
})
export class DatabaseModule {}
