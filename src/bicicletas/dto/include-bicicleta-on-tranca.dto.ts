import { IsNumber } from 'class-validator';

export class IncludeBicicletaOnTrancaDto {
  @IsNumber()
  idTranca: number;
  @IsNumber()
  idFuncionario: number;
  @IsNumber()
  idBicicleta: number;
}
