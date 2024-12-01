import { Totem } from 'src/totens/domain/totem';
import { TrancaEntity } from 'src/trancas/infra/persistence/entities/tranca.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('totens')
export class TotemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  localizacao: string;

  @Column()
  descricao: string;

  @OneToMany(() => TrancaEntity, (tranca) => tranca.totem)
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
