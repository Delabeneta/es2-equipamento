import { IsEnum, IsNumber } from 'class-validator';

export enum Opcao {
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
  @IsEnum(Opcao)
  opcao: Opcao;
}
