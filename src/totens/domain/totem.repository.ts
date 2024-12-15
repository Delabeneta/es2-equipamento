import { TrancaEntity } from 'src/trancas/domain/tranca.entity';
import { TotemEntity } from './totem.entity';
import { BicicletaEntity } from 'src/bicicletas/domain/bicicleta.entity';

export type CreateTotem = {
  localizacao: string;
  descricao: string;
};

export interface TotemRepository {
  findById(idTotem: number): Promise<TotemEntity>;
  findAll(): Promise<TotemEntity[]>;
  create(totem: CreateTotem): Promise<TotemEntity>;
  delete(idTotem: number): Promise<void>;
  findTrancasByTotemId(totemId: number): Promise<TrancaEntity[]>;
  findBicicletasByTotemId(totemId: number): Promise<BicicletaEntity[]>;
}
