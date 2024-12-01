import { Bicicleta, BicicletaStatus } from './bicicleta';

export type CreateBicicleta = {
  ano: string;
  marca: string;
  modelo: string;
  numero: number;
  status: BicicletaStatus;
};

export type UpdateBicicleta = Partial<CreateBicicleta>;

export interface BicicletaRepository {
  findById(idBicicleta: number): Promise<Bicicleta>;
  findAll(): Promise<Bicicleta[]>;
  create(bicicleta: CreateBicicleta): Promise<Bicicleta>;
  update(idBicicleta: number, data: UpdateBicicleta): Promise<Bicicleta>;
  delete(idBicicleta: number): Promise<void>;
}
