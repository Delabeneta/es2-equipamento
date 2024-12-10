import { IsNumber, IsString } from 'class-validator';

export class retirarBicicletaDaTrancaDto {
  @IsNumber()
  idTranca: number;
  @IsNumber()
  idFuncionario: number;
  @IsNumber()
  idBicicleta: number;
  @IsString()
  opcao?: string;
}
