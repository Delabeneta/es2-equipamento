import { TotemEntity } from './totem.entity';

export type CreateTotem = {
  localizacao: string;
  descricao: string;
};

export interface TotemRepository {
  findById(idTotem: number): Promise<TotemEntity>;
  findAll(): Promise<TotemEntity[]>;
  create(totem: CreateTotem): Promise<TotemEntity>;
  delete(idTotem: number): Promise<void>;
}
