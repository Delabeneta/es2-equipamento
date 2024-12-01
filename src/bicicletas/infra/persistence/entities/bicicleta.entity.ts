import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BicicletaStatus } from '../../../domain/bicicleta';
import { TrancaEntity } from 'src/trancas/infra/persistence/entities/tranca.entity';

@Entity('bicicletas')
export class BicicletaEntity {
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

  @OneToOne(() => TrancaEntity, (tranca) => tranca.bicicleta)
  tranca: TrancaEntity | null;
}
