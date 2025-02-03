import { TrancaStatus } from 'src/trancas/domain/tranca';
import { TrancaEntity } from 'src/trancas/domain/tranca.entity';
import {
  CreateTranca,
  TrancaRepository,
  UpdateTranca,
} from 'src/trancas/domain/tranca.repository';
import { Not, Repository } from 'typeorm';
import { TypeormTrancaEntity } from '../entities/typeorm-tranca.entity';

export class TypeormTrancaRepository implements TrancaRepository {
  constructor(private readonly repository: Repository<TypeormTrancaEntity>) {}

  async findByNumero(numero: number): Promise<TrancaEntity> {
    const tranca = await this.repository.findOne({
      where: { numero },
      relations: { totem: true, bicicleta: true },
    });

    return tranca;
  }
  async findById(idTranca: number): Promise<TrancaEntity> {
    const tranca = await this.repository.findOne({
      where: { id: idTranca },
      relations: { totem: true, bicicleta: true },
    });

    return tranca;
  }
  async delete(idTranca: number): Promise<void> {
    await this.repository.update(idTranca, {
      status: TrancaStatus.EXCLUIDA,
    });
  }

  async findAll(): Promise<TrancaEntity[]> {
    const trancas = await this.repository.find({
      where: {
        status: Not(TrancaStatus.EXCLUIDA),
      },
      relations: {
        totem: true,
        bicicleta: true,
      },
    });
    return trancas;
  }

  async update(idTranca: number, data: UpdateTranca): Promise<TrancaEntity> {
    await this.repository.update(idTranca, data);
    const trancas = await this.repository.findOne({
      where: {
        id: idTranca,
      },
      relations: { totem: true, bicicleta: true },
    });
    return trancas;
  }

  async create(tranca: CreateTranca): Promise<TrancaEntity> {
    return this.repository.save(tranca);
  }
  async saveLogInsercao(
    idTranca: number,
    LogInsercao: {
      dataHoraInsercao: string;
      idTranca: number;
      idFuncionario: number;
    },
  ) {
    // Encontre a tranca no banco de dados
    const tranca = await this.findById(idTranca);

    // Se não existir logsInsercao, inicialize como um array JSON vazio
    if (!tranca.logsInsercao) {
      tranca.logsInsercao = '[]'; // Inicializa como um array vazio em formato JSON
    }

    // Verifique se logsInsercao é uma string válida (em formato JSON)
    if (typeof tranca.logsInsercao === 'string') {
      try {
        // Converte a string JSON em um array
        const logsArray = JSON.parse(tranca.logsInsercao);

        // Adiciona o novo log ao array
        logsArray.push(LogInsercao);

        // Converte o array de volta para uma string JSON para salvar no banco
        tranca.logsInsercao = JSON.stringify(logsArray);
      } catch (error) {
        console.error('Erro ao analisar logsInsercao: ', error);
        throw new Error(
          'Erro ao analisar os logsInsercao. Verifique os dados armazenados.',
        );
      }
    } else {
      // Caso logsInsercao não seja uma string válida, inicializa com um array contendo o log
      tranca.logsInsercao = JSON.stringify([LogInsercao]);
    }

    // Salva a bicicleta com o novo log de inserção
    await this.create(tranca);
  }
}
