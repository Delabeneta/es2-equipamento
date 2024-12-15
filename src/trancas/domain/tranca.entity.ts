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

  static toDomain(trancaEntity: TrancaEntity) {
    if (!trancaEntity) return null;
    const tranca = new Tranca();
    tranca.localizacao = '';
    tranca.bicicleta = 0;
    tranca.anoDeFabricacao = trancaEntity.anoDeFabricacao;
    if (trancaEntity.bicicleta) {
      tranca.bicicleta = trancaEntity.bicicleta.id;
    }
    tranca.id = trancaEntity.id;
    if (trancaEntity.totem) {
      tranca.localizacao = trancaEntity.totem.localizacao;
    }
    tranca.modelo = trancaEntity.modelo;
    tranca.numero = trancaEntity.numero;
    tranca.status = trancaEntity.status;
    return tranca;
  }
}
