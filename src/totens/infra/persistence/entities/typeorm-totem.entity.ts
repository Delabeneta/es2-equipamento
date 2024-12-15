import { TypeormBicicletaEntity } from 'src/bicicletas/infra/persistence/entities/typeorm-bicicleta.entity';
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

  @OneToMany(() => TypeormTrancaEntity, (tranca) => tranca.totem, {
    cascade: true,
  })
  trancas: TypeormTrancaEntity[];

  @OneToMany(() => TypeormTrancaEntity, (bicicleta) => bicicleta.totem)
  bicicletas: TypeormBicicletaEntity[];
}
