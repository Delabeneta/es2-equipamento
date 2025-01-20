import { IsInt, IsEnum, IsNotEmpty } from 'class-validator';

export enum StatusAcaoReparador {
  APOSENTADA = 'APOSENTADA',
  EM_REPARO = 'EM_REPARO',
}

export class RetirarBicicletaDaTrancaDto {
  @IsInt()
  @IsNotEmpty()
  idTranca: number;

  @IsInt()
  @IsNotEmpty()
  idBicicleta: number;

  @IsInt()
  @IsNotEmpty()
  idFuncionario: number;

  @IsEnum(StatusAcaoReparador)
  @IsNotEmpty()
  statusAcaoReparador: StatusAcaoReparador;
}
