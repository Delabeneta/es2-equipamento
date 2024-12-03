import { EntitySchema } from 'typeorm';
import { TrancaEntity } from './tranca.entity'; // Importe corretamente o tipo da outra entidade.

export const BicicletaEntity = new EntitySchema({
  name: 'Bicicletas',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    marca: {
      type: String,
    },
    modelo: {
      type: String,
    },
    ano: {
      type: String,
    },
    numero: {
      type: Number,
    },
    status: {
      type: 'varchar', // Assume que BicicletaStatus é um tipo enum ou string
    },
    funcionarioId: {
      type: Number,
    },
    trancaId: {
      type: Number,
    },
  },
  relations: {
    tranca: {
      type: 'one-to-one',
      target: 'TrancaEntity', // Referência correta à entidade TrancaEntity
      inverseSide: 'bicicleta', // Relacionamento inverso no lado da entidade TrancaEntity
      nullable: true, // Permite que a bicicleta não tenha uma tranca
    },
  },
  relationIds: {
    trancaId: {
      relation: 'tranca', // Relacionamento com a propriedade 'tranca'
    },
  },
});

// Ajustando a entidade TrancaEntity
export const TrancaEntity = new EntitySchema({
  name: 'Trancas',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    // Defina outras colunas conforme necessário...
  },
  relations: {
    bicicleta: {
      type: 'one-to-one',
      target: 'BicicletaEntity',
      inverseSide: 'tranca', // Relacionamento inverso no lado da entidade BicicletaEntity
      nullable: true, // Permite que a tranca não tenha uma bicicleta associada
    },
  },
});

/* @Entity('bicicletas')
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

  @Column()
  funcionarioId: number;

  @Column()
  @RelationId((bicicleta: BicicletaEntity) => bicicleta.tranca)
  trancaId: number;
}
*/
