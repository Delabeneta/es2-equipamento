import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BicicletaStatus } from '../domain/bicicleta';

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

  @Column({ type: 'varchar' }) // Defina "nova" como valor inicial
  status: BicicletaStatus;
}
