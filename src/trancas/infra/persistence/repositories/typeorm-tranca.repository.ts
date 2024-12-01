import { Tranca, TrancaStatus } from 'src/trancas/domain/tranca';
import {
  CreateTranca,
  TrancaRepository,
  UpdateTranca,
} from 'src/trancas/domain/tranca.repository';
import { TrancaEntity } from 'src/trancas/infra/persistence/entities/tranca.entity';
import { Not, Repository } from 'typeorm';

export class TypeormTrancaRepository implements TrancaRepository {
  constructor(private readonly repository: Repository<TrancaEntity>) {}
  async findById(idTranca: number): Promise<Tranca> {
    const tranca = await this.repository.findOne({
      where: { id: idTranca },
      relations: { totem: true, bicicleta: true },
    });

    return TrancaEntity.toDomain(tranca);
  }
  async delete(idTranca: number): Promise<void> {
    await this.repository.update(idTranca, {
      status: TrancaStatus.EXCLUIDA,
    });
  }

  async findAll(): Promise<Tranca[]> {
    const trancas = await this.repository.find({
      where: {
        status: Not(TrancaStatus.EXCLUIDA),
      },
      relations: {
        totem: true,
        bicicleta: true,
      },
    });
    return trancas.map((trancas) => TrancaEntity.toDomain(trancas));
  }

  async update(idTranca: number, data: UpdateTranca): Promise<Tranca> {
    await this.repository.update(idTranca, data);
    const trancas = await this.repository.findOne({
      where: {
        id: idTranca,
      },
      relations: { totem: true, bicicleta: true },
    });
    return TrancaEntity.toDomain(trancas);
  }

  async create(tranca: CreateTranca): Promise<Tranca> {
    const salvar = await this.repository.save(tranca);
    return TrancaEntity.toDomain(salvar);
  }
}
