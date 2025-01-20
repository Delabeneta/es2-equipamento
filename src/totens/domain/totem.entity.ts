import { BicicletaEntity } from 'src/bicicletas/domain/bicicleta.entity';
import { Totem } from 'src/totens/domain/totem';
import { TrancaEntity } from 'src/trancas/domain/tranca.entity';

export class TotemEntity {
  id: number;
  localizacao: string;
  descricao: string;
  trancas: TrancaEntity[];
  bicicletas: BicicletaEntity[];

  static toDomain(totemEntity: TotemEntity) {
    if (!totemEntity) return null;
    const totem = new Totem();
    totem.id = totemEntity.id;
    totem.localizacao = totemEntity.localizacao;
    totem.descricao = totemEntity.descricao;

    return totem;
  }
}
