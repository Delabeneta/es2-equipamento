import { TrancaEntity } from 'src/trancas/domain/tranca.entity';
import { Bicicleta, BicicletaStatus } from './bicicleta';

export class BicicletaEntity {
  id: number;
  marca: string;
  modelo: string;
  ano: string;
  numero: number;
  status: BicicletaStatus;
  tranca: TrancaEntity | null;
  funcionarioId: number;
  trancaId: number;
  logsInsercao: any;
  static toDomain(entity: BicicletaEntity) {
    if (!entity) return null;
    const bicicleta = new Bicicleta();
    bicicleta.id = entity.id;
    bicicleta.marca = entity.marca;
    bicicleta.modelo = entity.modelo;
    bicicleta.ano = entity.ano;
    bicicleta.numero = entity.numero;
    bicicleta.status = entity.status;
    return bicicleta;
  }
}
