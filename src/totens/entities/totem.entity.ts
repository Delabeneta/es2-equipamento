/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Totem {
  @PrimaryGeneratedColumn('increment')
  numero: number;

  @Column()
  localizacao: string;

  @Column()
  descricao: string;
}
