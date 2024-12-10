import { BicicletaStatus } from './bicicleta';
import { BicicletaEntity } from './bicicleta.entity';

export type CreateBicicleta = {
  ano: string;
  marca: string;
  modelo: string;
  numero: number;
  status: BicicletaStatus;
  funcionarioId?: number;
};

export type UpdateBicicleta = Partial<CreateBicicleta>;

export interface BicicletaRepository {
  findById(idBicicleta: number): Promise<BicicletaEntity>;
  findAll(): Promise<BicicletaEntity[]>;
  create(bicicleta: CreateBicicleta): Promise<BicicletaEntity>;
  update(idBicicleta: number, data: UpdateBicicleta): Promise<BicicletaEntity>;
  delete(idBicicleta: number): Promise<void>;
  saveLogInsercao(
    idBicicleta: number,
    logInsercao: {
      dataHoraInsercao: string;
      idTranca: number;
      idFuncionario: number;
    },
  ): Promise<void>;
}
