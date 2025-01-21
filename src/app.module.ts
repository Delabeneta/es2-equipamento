import { Global, Module } from '@nestjs/common';
import { BicicletasModule } from 'src/bicicletas/bicicletas.module';
import { DatabaseModule } from './database/database.module';
import { TrancasModule } from './trancas/trancas.module';
import { TotemModule } from './totens/totem.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import axios from 'axios';
import AppService from './app.service';
import { DataSource } from 'typeorm';
import AppController from './app.controller';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    BicicletasModule,
    TrancasModule,
    TotemModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: AppService,
      useFactory: (dataSource: DataSource) => {
        return new AppService(dataSource);
      },
      inject: [DataSource],
    },
    {
      provide: 'ExternoMicrosserviceClient',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const externoServiceUrl = configService.get<string>(
          'EXTERNO_SERVICE_URL',
        );
        if (!externoServiceUrl) {
          throw new Error(
            'EXTERNO_SERVICE_URL não configurado nas variáveis de ambiente',
          );
        }
        return axios.create({
          baseURL: externoServiceUrl,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      },
    },
    {
      provide: 'AluguelMicrosserviceClient',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const aluguelServiceUrl = configService.get<string>(
          'ALUGUEL_SERVICE_URL',
        );
        if (!aluguelServiceUrl) {
          throw new Error(
            'ALUGUEL_SERVICE_URL não configurado nas variáveis de ambiente',
          );
        }
        return axios.create({
          baseURL: aluguelServiceUrl,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      },
    },
  ],
  exports: ['AluguelMicrosserviceClient', 'ExternoMicrosserviceClient'],
})
export class AppModule {}
