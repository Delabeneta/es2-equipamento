import { IsNumber } from 'class-validator';

export class IncluirTrancaDto {
  @IsNumber()
  idTranca: number;
  @IsNumber()
  idTotem: number;
  @IsNumber()
  idFuncionario: number;
}
