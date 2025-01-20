import { BicicletaEntity } from 'src/bicicletas/domain/bicicleta.entity';
import { TotemEntity } from 'src/totens/domain/totem.entity';
import { Tranca, TrancaStatus } from 'src/trancas/domain/tranca';

export class TrancaEntity {
  id: number;
  bicicleta: BicicletaEntity | null;
  bicicletaId: number;
  numero: number;
  totem: TotemEntity | null;
  totemId: number;
  modelo: string;
  anoDeFabricacao: string;
  status: TrancaStatus;
  funcionarioId: number;
  logsInsercao: any;

  static toDomain(trancaEntity: TrancaEntity) {
    if (!trancaEntity) return null;
    const tranca = new Tranca();
    tranca.id = trancaEntity.id;
    tranca.bicicleta = trancaEntity.bicicleta ? trancaEntity.bicicleta.id : 0;
    tranca.numero = trancaEntity.numero;
    tranca.localizacao = '';
    tranca.anoDeFabricacao = trancaEntity.anoDeFabricacao;
    if (trancaEntity.totem) {
      tranca.localizacao = trancaEntity.totem.localizacao;
    }
    tranca.modelo = trancaEntity.modelo;
    tranca.status = trancaEntity.status;
    return tranca;
  }
}
