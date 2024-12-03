import { TypeormTrancaEntity } from 'src/trancas/infra/persistence/entities/typeorm-tranca.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('totens')
export class TypeormTotemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  localizacao: string;

  @Column()
  descricao: string;

  @OneToMany(() => TypeormTrancaEntity, (tranca) => tranca.totem)
  trancas: TypeormTrancaEntity[];
}
