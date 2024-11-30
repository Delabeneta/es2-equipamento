import { Bicicleta, BicicletaStatus } from 'src/bicicletas/domain/bicicleta';
import {
  BicicletaPersistence,
  BicicletaRepository,
} from 'src/bicicletas/domain/bicicleta.repository';
import { BicicletaEntity } from 'src/bicicletas/entities/bicicleta.entity';
import { Not, Repository } from 'typeorm';

export class TypeormBicicletaRepository implements BicicletaRepository {
  constructor(private readonly repository: Repository<BicicletaEntity>) {}
  findById(idBicicleta: number): Promise<BicicletaPersistence> {
    return this.repository.findOneBy({
      id: idBicicleta,
    });
  }
  async delete(idBicicleta: number): Promise<void> {
    await this.repository.update(idBicicleta, {
      status: BicicletaStatus.EXCLUIDA,
    });
  }

  async findAll(): Promise<BicicletaPersistence[]> {
    return this.repository.find({
      where: {
        status: Not(BicicletaStatus.EXCLUIDA),
      },
    });
  }

  async update(
    idBicicleta: number,
    data: Partial<Bicicleta>,
  ): Promise<BicicletaPersistence> {
    await this.repository.update(idBicicleta, data);
    return this.repository.findOneBy({
      id: idBicicleta,
    });
  }

  async create(bicicleta: Bicicleta): Promise<BicicletaPersistence> {
    return this.repository.save(bicicleta);
  }
}
