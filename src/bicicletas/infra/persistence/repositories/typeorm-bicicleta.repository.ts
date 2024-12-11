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
      idTranca: number;
      idFuncionario: number;
    },
  ) {
    const bicicleta = await this.findById(idBicicleta);
    if (!bicicleta.logsInsercao) {
      bicicleta.logsInsercao = [];
    }
    bicicleta.logsInsercao.push(LogInsercao);
    await this.create(bicicleta);
  }
}
