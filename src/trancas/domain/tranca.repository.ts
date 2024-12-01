import { Tranca, TrancaStatus } from './tranca';

export type CreateTranca = {
  anoDeFabricacao: string;
  modelo: string;
  numero: number;
  status: TrancaStatus;
};

export type UpdateTranca = Partial<CreateTranca>;

export interface TrancaRepository {
  findById(idTranca: number): Promise<Tranca>;
  findAll(): Promise<Tranca[]>;
  create(tranca: CreateTranca): Promise<Tranca>;
  update(idTranca: number, data: UpdateTranca): Promise<Tranca>;
  delete(idTranca: number): Promise<void>;
}
