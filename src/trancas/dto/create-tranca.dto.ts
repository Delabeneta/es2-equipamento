import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TrancaStatus } from '../domain/tranca';

export class CreateTrancaDto {
  @IsNotEmpty()
  @IsString()
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
