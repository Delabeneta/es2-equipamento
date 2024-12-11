import { IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class TrancarTrancaDto {
  @IsNumber()
  @IsNotEmpty()
  idTranca: number;
  @IsInt()
  @IsOptional()
  bicicletaId?: number;
}
