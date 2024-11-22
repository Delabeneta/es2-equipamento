/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class bicicleta {
  @PrimaryGeneratedColumn('increment')
  numero: number;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @Column()
  ano: number;

  @Column()
  status: string = 'nova';
}
