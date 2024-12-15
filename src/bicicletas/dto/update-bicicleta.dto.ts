import { IsString, Matches, IsOptional, IsNumber } from 'class-validator';

export class UpdateBicicletaDto {
  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'Ano deve ser um ano válido (YYYY).' })
  ano?: string;

  @IsOptional()
  @IsNumber()
  funcionarioId?: number;
}
