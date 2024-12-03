import { BicicletaEntity } from 'src/bicicletas/domain/bicicleta.entity';
import { TotemEntity } from 'src/totens/domain/totem.entity';
import { Tranca, TrancaStatus } from 'src/trancas/domain/tranca';

export class TrancaEntity {
  id: number;
  numero: number;
  status: TrancaStatus;
  modelo: string;
  anoDeFabricacao: string;
  bicicleta: BicicletaEntity | null;
  totem: TotemEntity | null;
  totemId: number;
  bicicletaid: number;

  static toDomain(trancaEntity: TrancaEntity) {
    const tranca = new Tranca();
    tranca.localizacao = '';
    tranca.bicicleta = 0;
    tranca.anoDeFabricacao = trancaEntity.anoDeFabricacao;
    if (trancaEntity.bicicleta) {
      tranca.bicicleta = trancaEntity.bicicleta.numero;
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
