import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { BicicletaStatus } from '../domain/bicicleta';

export class CreateBicicletaDto {
  @IsString()
  @IsNotEmpty()
  marca: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsString()
  @Matches(/^\d{4}$/, { message: 'Ano deve ser um ano válido (YYYY).' })
  ano: string;

  @IsNumber()
  @IsOptional()
  numero?: number;

  @IsEnum(BicicletaStatus)
  @IsOptional()
  status?: BicicletaStatus;
}
