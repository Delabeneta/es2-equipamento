import { IsEnum, IsNumber } from 'class-validator';

export enum StatusAcaoReparador {
  APOSENTADORIA = 'APOSENTADORIA',
  EM_REPARO = 'REPARO',
}

export class RetirarTrancaDto {
  @IsNumber()
  idTranca: number;
  @IsNumber()
  idTotem: number;
  @IsNumber()
  idFuncionario: number;
  @IsEnum(StatusAcaoReparador)
  statusAcaoReparador: StatusAcaoReparador;
}
