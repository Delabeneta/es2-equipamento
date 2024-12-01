import { Totem } from './totem';

export type CreateTotem = {
  localizacao: string;
  descricao: string;
};

export interface TotemRepository {
  findById(idTotem: number): Promise<Totem>;
  findAll(): Promise<Totem[]>;
  create(totem: CreateTotem): Promise<Totem>;
  delete(idTotem: number): Promise<void>;
}
