import {
  CreateTotem,
  TotemRepository,
} from 'src/totens/domain/totem.repository';
import { TotemEntity } from '../entities/totem.entity';
import { Repository } from 'typeorm';
import { Totem } from 'src/totens/domain/totem';

export class TypeormTotemRepository implements TotemRepository {
  constructor(private readonly repository: Repository<TotemEntity>) {}
  async findById(idTotem: number): Promise<Totem> {
    const totem = await this.repository.findOne({
      where: { id: idTotem },
    });

    return TotemEntity.toDomain(totem);
  }
  async delete(idTotem: number): Promise<void> {
    await this.repository.delete(idTotem);
  }

  async findAll(): Promise<Totem[]> {
    const totens = await this.repository.find();
    return totens.map((totens) => TotemEntity.toDomain(totens));
  }

  async create(totem: CreateTotem): Promise<Totem> {
    const salvar = await this.repository.save(totem);
    return TotemEntity.toDomain(salvar);
  }
}
