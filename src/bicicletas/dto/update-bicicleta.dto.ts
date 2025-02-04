import {
  IsString,
  Matches,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { BicicletaStatus } from '../domain/bicicleta';

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

  @IsEnum(BicicletaStatus)
  @IsOptional()
  status?: BicicletaStatus;

  @IsNumber()
  @IsOptional()
  numero?: number;

  @IsOptional()
  @IsNumber()
  funcionarioId?: number;
}
