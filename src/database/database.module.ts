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
          type: 'sqlite', // Alterado para SQLite
          database: config.get('DATABASE_NAME'), // Caminho para o arquivo SQLite
          synchronize: true, // Para desenvolvimento; desative em produção
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
