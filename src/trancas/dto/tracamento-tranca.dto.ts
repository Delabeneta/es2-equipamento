import { IsInt, IsOptional } from 'class-validator';

export class TrancamentoTrancaDto {
  @IsInt()
  @IsOptional()
  idBicicleta?: number;
}
