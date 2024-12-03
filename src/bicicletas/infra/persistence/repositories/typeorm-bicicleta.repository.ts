import { Bicicleta, BicicletaStatus } from 'src/bicicletas/domain/bicicleta';
import { BicicletaEntity } from 'src/bicicletas/domain/bicicleta.entity';
import { BicicletaRepository } from 'src/bicicletas/domain/bicicleta.repository';
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
    const teste = await this.repository.find({
      where: {
        status: Not(BicicletaStatus.EXCLUIDA),
      },
    });
    console.log(teste);
    return teste;
  }

  async update(
    idBicicleta: number,
    data: Partial<Bicicleta>,
  ): Promise<BicicletaEntity> {
    await this.repository.update(idBicicleta, data);
    return this.repository.findOneBy({
      id: idBicicleta,
    });
  }

  async create(bicicleta: Bicicleta): Promise<BicicletaEntity> {
    const entity = this.repository.create(bicicleta);
    return this.repository.save(entity);
  }
}
