import { EntityRepository, Repository } from 'typeorm';
import { InclusaoBicicletaRegistro } from '../infra/persistence/entities/inclusao-bicicleta-registro.entity';

@EntityRepository(InclusaoBicicletaRegistro)
export class InclusaoBicicletaRegistroRepository extends Repository<InclusaoBicicletaRegistro> {
  async saveRegistro(
    registro: InclusaoBicicletaRegistro,
  ): Promise<InclusaoBicicletaRegistro> {
    return this.save(registro);
  }
}
