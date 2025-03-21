import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeormBicicletaEntity } from './bicicletas/infra/persistence/entities/typeorm-bicicleta.entity';
import { TypeormTrancaEntity } from './trancas/infra/persistence/entities/typeorm-tranca.entity';
import { TypeormTotemEntity } from './totens/infra/persistence/entities/typeorm-totem.entity';
import { generateRandomNumber } from './common/utils/random-number';
import { BicicletaStatus } from './bicicletas/domain/bicicleta';
import { TrancaStatus } from './trancas/domain/tranca';

@Injectable()
export default class AppService {
  constructor(
    @Inject('DataSource')
    private readonly dataSource: DataSource,
  ) {}

  async restoreDatabase() {
    await this.dataSource.query('DELETE FROM trancas');
    await this.dataSource.query(
      'UPDATE sqlite_sequence SET seq = 0 WHERE name = "trancas"',
    );

    await this.dataSource.query('DELETE FROM totens');
    await this.dataSource.query(
      'UPDATE sqlite_sequence SET seq = 0 WHERE name = "totens"',
    );

    await this.dataSource.query('DELETE FROM bicicletas');
    await this.dataSource.query(
      'UPDATE sqlite_sequence SET seq = 0 WHERE name = "bicicletas"',
    );

    const bicicletaRepository = this.dataSource.getRepository(
      TypeormBicicletaEntity,
    );

    const trancasRepository =
      this.dataSource.getRepository(TypeormTrancaEntity);

    const totensRepository = this.dataSource.getRepository(TypeormTotemEntity);

    const totem = await totensRepository.save({
      localizacao: 'Rio de Janeiro',
      descricao: 'Totem 1',
    });

    const bicicleta1 = await bicicletaRepository.save({
      numero: 12345,
      ano: '2020',
      modelo: 'Caloi',
      status: BicicletaStatus.DISPONIVEL,
      marca: 'Caloi',
    });

    const bicicleta2 = await bicicletaRepository.save({
      ano: '2020',
      modelo: 'Caloi',
      status: BicicletaStatus.REPARO_SOLICITADO,
      marca: 'Caloi',
      numero: 12345,
    });

    await bicicletaRepository.save({
      numero: 12345,
      ano: '2020',
      modelo: 'Caloi',
      status: BicicletaStatus.EM_USO,
      marca: 'Caloi',
    });

    await bicicletaRepository.save({
      numero: 12345,
      ano: '2020',
      modelo: 'Caloi',
      status: BicicletaStatus.EM_REPARO,
      marca: 'Caloi',
      funcionarioId: 1,
    });

    const bicicleta5 = await bicicletaRepository.save({
      numero: 12345,
      ano: '2020',
      modelo: 'Caloi',
      status: BicicletaStatus.EM_USO,
      marca: 'Caloi',
    });

    const tranca1 = await trancasRepository.save({
      anoDeFabricacao: '2020',
      modelo: 'Caloi',
      status: TrancaStatus.OCUPADA,
      bicicletaId: bicicleta1.id,
      totemId: totem.id,
      localizacao: 'Rio de Janeiro',
      numero: generateRandomNumber(),
    });

    await trancasRepository.save({
      anoDeFabricacao: '2020',
      modelo: 'Caloi',
      status: TrancaStatus.LIVRE,
      totemId: totem.id,
      numero: 12345,
      localizacao: 'Rio de Janeiro',
    });

    const tranca3 = await trancasRepository.save({
      anoDeFabricacao: '2020',
      modelo: 'Caloi',
      status: TrancaStatus.OCUPADA,
      bicicletaId: bicicleta2.id,
      totemId: totem.id,
      numero: 12345,
      localizacao: 'Rio de Janeiro',
    });

    const tranca4 = await trancasRepository.save({
      anoDeFabricacao: '2020',
      modelo: 'Caloi',
      status: TrancaStatus.OCUPADA,
      bicicletaId: bicicleta5.id,
      totemId: totem.id,
      numero: 12345,
      localizacao: 'Rio de Janeiro',
    });

    await trancasRepository.save({
      anoDeFabricacao: '2020',
      modelo: 'Caloi',
      status: TrancaStatus.EM_REPARO,
      numero: 12345,
      funcionarioId: 1,
      localizacao: 'Rio de Janeiro',
    });

    await trancasRepository.save({
      anoDeFabricacao: '2020',
      modelo: 'Caloi',
      status: TrancaStatus.REPARO_SOLICITADO,
      totemId: totem.id,
      numero: 12345,
      localizacao: 'Rio de Janeiro',
    });

    bicicleta1.trancaId = tranca1.id;
    await bicicletaRepository.save(bicicleta1);

    bicicleta2.trancaId = tranca3.id;
    await bicicletaRepository.save(bicicleta2);

    bicicleta5.trancaId = tranca4.id;
    await bicicletaRepository.save(bicicleta5);
  }
}
