import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { TrancaStatus } from '../domain/tranca';

export class CreateTrancaDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'Ano deve ser um ano válido (YYYY).' })
  anoDeFabricacao: string;

  @IsNotEmpty()
  @IsString()
  modelo: string;

  @IsString()
  @IsOptional()
  localizacao?: string;

  @IsNumber()
  @IsOptional()
  numero?: number;

  @IsOptional()
  @IsEnum(TrancaStatus)
  status?: TrancaStatus;
}
