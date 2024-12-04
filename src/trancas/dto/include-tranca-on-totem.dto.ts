import { IsNumber } from 'class-validator';

export class IncludeTrancaOnTotemDto {
  @IsNumber()
  idTranca: number;
  @IsNumber()
  idFuncionario: number;
  @IsNumber()
  idTotem: number;
}
