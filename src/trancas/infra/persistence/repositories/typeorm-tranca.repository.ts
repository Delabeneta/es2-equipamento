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
}
