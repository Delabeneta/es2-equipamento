import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Global()
@Module({
  providers: [
    {
      provide: DataSource,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const dataSource = new DataSource({
          type: 'postgres',
          host: config.get('DATABASE_HOST'),
          port: parseInt(config.get('DATABASE_PORT')),
          username: config.get('DATABASE_USER'),
          password: config.get('DATABASE_PASSWORD'),
          database: config.get('DATABASE_NAME'),
          synchronize: true,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        });
        // console.log(dataSource); //<- log here to check they are filled correctly

        await dataSource.initialize();
        return dataSource;
      },
    },
  ],
  exports: [DataSource],
})
export class DatabaseModule {}
