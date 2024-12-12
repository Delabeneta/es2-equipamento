import { BicicletaStatus } from 'src/bicicletas/domain/bicicleta';
import { BicicletaEntity } from 'src/bicicletas/domain/bicicleta.entity';
import {
  BicicletaRepository,
  CreateBicicleta,
  UpdateBicicleta,
} from 'src/bicicletas/domain/bicicleta.repository';
import { Not, Repository } from 'typeorm';
import { TypeormBicicletaEntity } from '../entities/typeorm-bicicleta.entity';

export class TypeormBicicletaRepository implements BicicletaRepository {
  constructor(
    private readonly repository: Repository<TypeormBicicletaEntity>,
  ) {}
  findById(idBicicleta: number): Promise<BicicletaEntity> {
    return this.repository.findOne({
      where: {
        id: idBicicleta,
        status: Not(BicicletaStatus.EXCLUIDA),
      },
    });
  }

  async delete(idBicicleta: number): Promise<void> {
    await this.repository.update(idBicicleta, {
      status: BicicletaStatus.EXCLUIDA,
    });
  }

  async findAll(): Promise<BicicletaEntity[]> {
    const bicicletas = await this.repository.find({
      where: {
        status: Not(BicicletaStatus.EXCLUIDA),
      },
    });
    return bicicletas;
  }

  async update(
    idBicicleta: number,
    data: UpdateBicicleta,
  ): Promise<BicicletaEntity> {
    await this.repository.update(idBicicleta, data);
    return this.repository.findOne({
      where: {
        id: idBicicleta,
        status: Not(BicicletaStatus.EXCLUIDA),
      },
    });
  }

  async create(bicicleta: CreateBicicleta): Promise<BicicletaEntity> {
    const entity = this.repository.create(bicicleta);
    return this.repository.save(entity);
  }
  async saveLogInsercao(
    idBicicleta: number,
    LogInsercao: {
      dataHoraInsercao: string;
      idBicicleta: number;
      idTranca: number;
      idFuncionario: number;
    },
  ) {
    // Encontre a bicicleta no banco de dados
    const bicicleta = await this.findById(idBicicleta);

    // Se não existir logsInsercao, inicialize como um array JSON vazio
    if (!bicicleta.logsInsercao) {
      bicicleta.logsInsercao = '[]'; // Inicializa como um array vazio em formato JSON
    }

    // Verifique se logsInsercao é uma string válida (em formato JSON)
    if (typeof bicicleta.logsInsercao === 'string') {
      try {
        // Converte a string JSON em um array
        const logsArray = JSON.parse(bicicleta.logsInsercao);

        // Adiciona o novo log ao array
        logsArray.push(LogInsercao);

        // Converte o array de volta para uma string JSON para salvar no banco
        bicicleta.logsInsercao = JSON.stringify(logsArray);
      } catch (error) {
        console.error('Erro ao analisar logsInsercao: ', error);
        throw new Error(
          'Erro ao analisar os logsInsercao. Verifique os dados armazenados.',
        );
      }
    } else {
      // Caso logsInsercao não seja uma string válida, inicializa com um array contendo o log
      bicicleta.logsInsercao = JSON.stringify([LogInsercao]);
    }

    // Salva a bicicleta com o novo log de inserção
    await this.create(bicicleta);
  }
}
