import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InclusaoBicicletaRegistroRepository } from './domain/inclusao-bicicleta-registro.repository';
import { InclusaoBicicletaRegistro } from './infra/persistence/entities/inclusao-bicicleta-registro.entity';

@Injectable()
export class InclusaoBicicletaRegistroService {
  constructor(
    @InjectRepository(InclusaoBicicletaRegistroRepository)
    private readonly registroRepository: InclusaoBicicletaRegistroRepository,
  ) {}

  async criarRegistro(
    dataHoraInsercao: string,
    idBicicleta: number,
    idTranca: number,
    idFuncionario: number,
  ): Promise<InclusaoBicicletaRegistro> {
    const registro = new InclusaoBicicletaRegistro();
    registro.dataHoraInsercao = dataHoraInsercao;
    registro.idBicicleta = idBicicleta;
    registro.idTranca = idTranca;
    registro.idFuncionario = idFuncionario;
    return this.registroRepository.saveRegistro(registro);
  }
}
