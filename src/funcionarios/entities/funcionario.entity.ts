/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Funcionario {
  @PrimaryGeneratedColumn('increment')
  matricula: number;

  @Column()
  nome: string;

  @Column()
  email: string;
}
