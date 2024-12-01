import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTrancaDto {
  @IsNotEmpty()
  @IsString()
  anoDeFabricacao: string;

  @IsNotEmpty()
  @IsString()
  modelo: string;
}
