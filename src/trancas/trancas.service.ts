/* eslint-disable prettier/prettier */
import { Inject, Injectable} from '@nestjs/common';
import { CreateTrancaDto } from '../trancas/dto/create-tranca.dto';
import { UpdateTrancaDto } from '../trancas/dto/update-tranca.dto';
import { Tranca, TrancaStatus } from '../trancas/domain/tranca';
import { generateRandomNumber } from '../utils/random-number';
import { TrancaRepository } from '../trancas/domain/tranca.repository';

//  @InjectRepository é usado para injetar um repositório
// associado a uma entidade diretamente no serviço.

// Posso usar métodos sem precisar instanciar o repósito manualmente
// Um repositorio atua como uma camada de abstração, 
// entre o codigo e o BD  faacilitando realiar o CRUD


@Injectable()
export class TrancasService {
  constructor(
    @Inject('TrancaRepository')
    private readonly trancaRepository: TrancaRepository, //
  ) {}

  async delete(idTranca: number) {
    const trancaExistente =
      await this.trancaRepository.findById(idTranca);
    if (!trancaExistente) {
      throw new Error('Tranca não encontrada');
    }

    if (trancaExistente.status === TrancaStatus.OCUPADA) {
      throw new Error('Apenas Trancas sem bicicletas podem ser excluídas');
    }
    return this.trancaRepository.delete(idTranca);
  }

  async findAll(): Promise<Tranca[]> {
    const trancas = await this.trancaRepository.findAll();
    
    return trancas;
  }

  async update(idTranca: number, updateTrancaDto: UpdateTrancaDto) {
    const trancaExistente =
      await this.trancaRepository.findById(idTranca);
    if (!trancaExistente) {
      throw new Error('Tranca não encontrada');
    }
    return this.trancaRepository.update(idTranca, updateTrancaDto);
  }

  // criar uma tranca
  create(createTrancaDto: CreateTrancaDto) {
    const trancaNumero = generateRandomNumber();
    const trancaStatus = TrancaStatus.NOVA;

    return this.trancaRepository.create({
      status: trancaStatus,
      numero: trancaNumero,
      modelo: createTrancaDto.modelo,
      anoDeFabricacao: createTrancaDto.anoDeFabricacao,
    });
  }



}
