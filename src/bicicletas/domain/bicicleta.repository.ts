import { Bicicleta } from './bicicleta';

export type BicicletaPersistence = Bicicleta & { id: number };

export interface BicicletaRepository {
  findById(idBicicleta: number): Promise<BicicletaPersistence>;
  delete(idBicicleta: number): Promise<void>;
  findAll(): Promise<BicicletaPersistence[]>;
  create(bicicleta: Bicicleta): Promise<BicicletaPersistence>;
  update(
    idBicicleta: number,
    data: Partial<Bicicleta>,
  ): Promise<BicicletaPersistence>;
}
