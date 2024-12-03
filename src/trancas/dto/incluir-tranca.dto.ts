import { IsNumber } from 'class-validator';

export class IncluirTrancaDto {
  @IsNumber()
  trancaId: number;

  @IsNumber()
  totemId: number;

  @IsNumber()
  funcionarioId: number;
}
