import { TypeormBicicletaEntity } from 'src/bicicletas/infra/persistence/entities/typeorm-bicicleta.entity';
import { TypeormTotemEntity } from 'src/totens/infra/persistence/entities/typeorm-totem.entity';
import { TrancaStatus } from 'src/trancas/domain/tranca';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';

@Entity('trancas')
export class TypeormTrancaEntity {
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
  @OneToOne(() => TypeormBicicletaEntity, (bicicleta) => bicicleta.tranca)
  @JoinColumn()
  bicicleta: TypeormBicicletaEntity | null;
  @ManyToOne(() => TypeormTotemEntity, (totem) => totem.trancas)
  totem: TypeormTotemEntity | null;
  @Column({ nullable: true })
  @RelationId((tranca: TypeormTrancaEntity) => tranca.totem)
  totemId: number;
  @Column({ nullable: true })
  @RelationId((tranca: TypeormTrancaEntity) => tranca.bicicleta)
  bicicletaid: number;
  @Column({ nullable: true })
  funcionarioId: number;
}
