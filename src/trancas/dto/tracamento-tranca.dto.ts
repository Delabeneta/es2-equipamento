import { IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class TrancamentoTrancaDto {
  @IsNumber()
  @IsNotEmpty()
  idTranca: number;
  @IsInt()
  @IsOptional()
  idBicicleta?: number;
}
