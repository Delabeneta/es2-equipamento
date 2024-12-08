import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class TrancarTrancaDto {
  @IsNumber()
  idTranca: number;
  @IsInt()
  @IsOptional()
  bicicletaId?: number;
}
