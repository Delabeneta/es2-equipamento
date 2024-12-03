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
    return this.repository.findOneBy({
      id: idBicicleta,
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
    return this.repository.findOneBy({
      id: idBicicleta,
    });
  }

  async create(bicicleta: CreateBicicleta): Promise<BicicletaEntity> {
    const entity = this.repository.create(bicicleta);
    return this.repository.save(entity);
  }
}
