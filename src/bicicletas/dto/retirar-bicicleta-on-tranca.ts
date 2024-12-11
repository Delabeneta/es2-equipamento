import { IsNumber, IsString } from 'class-validator';

export class RetirarBicicletaDaTrancaDto {
  @IsNumber()
  idTranca: number;
  @IsNumber()
  idFuncionario: number;
  @IsNumber()
  idBicicleta: number;
  @IsString()
  opcao: string;
}
