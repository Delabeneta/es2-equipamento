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

  @Column()
  status: TrancaStatus;

  @Column()
  modelo: string;

  @Column()
  anoDeFabricacao: string;

  @Column({ nullable: true })
  localizacao: string;

  @OneToOne(() => TypeormBicicletaEntity, (bicicleta) => bicicleta.tranca, {
    nullable: true,
  })
  @JoinColumn()
  bicicleta: TypeormBicicletaEntity | null;

  @ManyToOne(() => TypeormTotemEntity, (totem) => totem.trancas, {
    nullable: true,
  })
  @JoinColumn()
  totem: TypeormTotemEntity | null;

  @Column({ nullable: true })
  @RelationId((tranca: TypeormTrancaEntity) => tranca.totem)
  totemId: number;

  @Column({ nullable: true })
  @RelationId((tranca: TypeormTrancaEntity) => tranca.bicicleta)
  bicicletaId: number;

  @Column({ nullable: true })
  funcionarioId: number;

  @Column('text', { nullable: true })
  logsInsercao: string;
}
