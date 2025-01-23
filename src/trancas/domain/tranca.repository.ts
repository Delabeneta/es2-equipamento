import { TrancaStatus } from './tranca';
import { TrancaEntity } from './tranca.entity';

export type CreateTranca = {
  anoDeFabricacao: string;
  modelo: string;
  numero: number;
  status: TrancaStatus;
};

export type UpdateTranca = Partial<CreateTranca> & {
  bicicleta?: {
    id: number;
  };
  totem?: {
    id: number;
  };
};

export interface TrancaRepository {
  findById(idTranca: number): Promise<TrancaEntity>;
  findAll(): Promise<TrancaEntity[]>;
  create(tranca: CreateTranca): Promise<TrancaEntity>;
  update(idTranca: number, data: UpdateTranca): Promise<TrancaEntity>;
  delete(idTranca: number): Promise<void>;
  saveLogInsercao(LogInsercao: {
    dataHoraInsercao: string;
    idTranca: number;
  }): Promise<void>;
}
