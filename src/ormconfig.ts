/*  Aqui, eu vou definir configs de conexão com o BD
    seja o tipo, nome e/ou opcoes, como synchronize (que cria automaticamente as tabelas com base nas entidades).  
*/
import { DataSourceOptions } from 'typeorm';

export const config: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'myuser',
  password: 'mypassword',
  database: 'bicicletas_db', // Nome do banco de dados, igual ao do docker-compose
  synchronize: true,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
};
