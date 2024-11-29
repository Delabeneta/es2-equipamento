/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tranca {
  @PrimaryGeneratedColumn('increment')
  numero: string;
  status: 'nova' | 'livre' | 'ocupada' | 'EM_REPARO' | 'APOSENTADA';
  localizacao: string;
  anoFabricacao: number;
  modelo: string;
}
