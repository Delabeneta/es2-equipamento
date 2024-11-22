/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTrancaDto {
  @IsNotEmpty()
  @IsString()
  numero: string;

  @IsNotEmpty()
  @IsString()
  localizacao: string;

  @IsNotEmpty()
  @IsNumber()
  anoFabricacao: number;

  @IsNotEmpty()
  @IsString()
  modelo: string;
}
