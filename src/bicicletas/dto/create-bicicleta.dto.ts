import { IsString, Matches } from 'class-validator';

export class CreateBicicletaDto {
  @IsString()
  marca: string;

  @IsString()
  modelo: string;

  @IsString()
  @Matches(/^\d{4}$/, { message: 'Ano deve ser um ano válido (YYYY).' })
  ano: string;
}
