import { BicicletaEntity } from 'src/bicicletas/infra/persistence/entities/bicicleta.entity';
import { TotemEntity } from 'src/totens/infra/persistence/entities/totem.entity';
import { Tranca, TrancaStatus } from 'src/trancas/domain/tranca';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class TrancaEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  numero: number;
  @Column({ type: 'varchar' })
  status: TrancaStatus;
  @Column()
  modelo: string;
  @Column()
  anoDeFabricacao: string;
  @OneToOne(() => BicicletaEntity, (bicicleta) => bicicleta.tranca)
  @JoinColumn()
  bicicleta: BicicletaEntity | null;

  @ManyToOne(() => TotemEntity, (totem) => totem.trancas)
  totem: TotemEntity | null;

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
