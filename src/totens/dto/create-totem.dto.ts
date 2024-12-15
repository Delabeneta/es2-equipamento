import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTotemDto {
  @IsString()
  @IsNotEmpty()
  localizacao: string;
  @IsString()
  @IsNotEmpty()
  descricao: string;
}
