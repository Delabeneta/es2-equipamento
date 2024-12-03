import { Totem } from 'src/totens/domain/totem';
import { TrancaEntity } from 'src/trancas/domain/tranca.entity';

export class TotemEntity {
  id: number;
  localizacao: string;
  descricao: string;
  trancas: TrancaEntity[];

  static toDomain(totemEntity: TotemEntity) {
    if (!totemEntity) return null;
    const totem = new Totem();
    totem.localizacao = totemEntity.localizacao;
    totem.descricao = totemEntity.descricao;
    totem.id = totemEntity.id;

    return totem;
  }
}
