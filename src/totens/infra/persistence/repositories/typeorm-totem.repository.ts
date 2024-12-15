import {
  CreateTotem,
  TotemRepository,
} from 'src/totens/domain/totem.repository';
import { Repository } from 'typeorm';
import { TypeormTotemEntity } from '../entities/typeorm-totem.entity';
import { TotemEntity } from 'src/totens/domain/totem.entity';
import { TrancaEntity } from 'src/trancas/domain/tranca.entity';
import { BicicletaEntity } from 'src/bicicletas/domain/bicicleta.entity';

export class TypeormTotemRepository implements TotemRepository {
  constructor(private readonly repository: Repository<TypeormTotemEntity>) {}
  async findById(idTotem: number): Promise<TotemEntity> {
    const totem = await this.repository.findOne({
      where: { id: idTotem },
      relations: ['trancas'],
    });

    return totem;
  }

  async delete(idTotem: number): Promise<void> {
    await this.repository.delete(idTotem);
  }

  async findAll(): Promise<TotemEntity[]> {
    const totens = await this.repository.find();
    return totens;
  }

  async create(totem: CreateTotem): Promise<TotemEntity> {
    return this.repository.save(totem);
  }

  async findTrancasByTotemId(totemId: number): Promise<TrancaEntity[]> {
    const totem = await this.repository.findOne({
      where: { id: totemId },
      relations: ['trancas'],
    });
    return totem.trancas;
  }
  async findBicicletasByTotemId(totemId: number): Promise<BicicletaEntity[]> {
    const totem = await this.repository.findOne({
      where: { id: totemId },
      relations: ['bicicletas'],
    });
    if (!totem) {
      throw new Error('Totem não encontrado');
    }
    return totem.bicicletas;
  }
}
