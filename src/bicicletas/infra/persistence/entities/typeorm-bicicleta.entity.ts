import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { BicicletaStatus } from '../../../domain/bicicleta';
import { TypeormTrancaEntity } from 'src/trancas/infra/persistence/entities/typeorm-tranca.entity';

@Entity('bicicletas')
export class TypeormBicicletaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @Column()
  ano: string;

  @Column()
  numero: number;

  @Column({ type: 'varchar' })
  status: BicicletaStatus;

  @OneToOne(() => TypeormTrancaEntity, (tranca) => tranca.bicicleta)
  tranca: TypeormTrancaEntity | null;

  @Column({
    nullable: true,
  })
  funcionarioId: number;

  @Column({ nullable: true })
  @RelationId((bicicleta: TypeormBicicletaEntity) => bicicleta.tranca)
  trancaId: number;

  @Column('jsonb', { nullable: true })
  logsInsercao: Array<{
    dataHoraInsercao: string;
    idTranca: number;
    idFuncionario: number;
  }>;
}
