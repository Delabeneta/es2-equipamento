/* eslint-disable prettier/prettier */
import { Inject, Injectable} from '@nestjs/common';
import { CreateTrancaDto } from '../trancas/dto/create-tranca.dto';
import { UpdateTrancaDto } from '../trancas/dto/update-tranca.dto';
import { Tranca, TrancaStatus } from '../trancas/domain/tranca';
import { generateRandomNumber } from '../utils/random-number';
import { TrancaRepository } from '../trancas/domain/tranca.repository';
import { TrancaEntity } from './domain/tranca.entity';
import { IncluirTrancaDto } from './dto/incluir-tranca.dto';

//  @InjectRepository é usado para injetar um repositório
// associado a uma entidade diretamente no serviço.

// Posso usar métodos sem precisar instanciar o repósito manualmente
// Um repositorio atua como uma camada de abstração, 
// entre o codigo e o BD  faacilitando realiar o CRUD


@Injectable()
export class TrancasService {
  totemRepository: any;
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
    return trancas.map(tranca => TrancaEntity.toDomain(tranca)); ;
  }

  async update(idTranca: number, updateTrancaDto: UpdateTrancaDto) {
    const trancaExistente =
      await this.trancaRepository.findById(idTranca);
    if (!trancaExistente) {
      throw new Error('Tranca não encontrada');
    }
    const updatedTranca = await this.trancaRepository.update(idTranca, updateTrancaDto);
    return TrancaEntity.toDomain(updatedTranca);
  }


  // criar uma tranca
   async create(createTrancaDto: CreateTrancaDto) {
    const trancaNumero = generateRandomNumber();
    const trancaStatus = TrancaStatus.NOVA;
    const createdTranca = await this.trancaRepository.create({
      status: trancaStatus,
      numero: trancaNumero,
      modelo: createTrancaDto.modelo,
      anoDeFabricacao: createTrancaDto.anoDeFabricacao,
    });
    return TrancaEntity.toDomain(createdTranca);

  }

  
  async incluirNoTotem(incluirTrancaDto: IncluirTrancaDto) {
     const { trancaId, totemId, funcionarioId } = incluirTrancaDto;
     const tranca = await this.trancaRepository.findById(trancaId); 
     
     if (!tranca) { throw new Error('Tranca não encontrada'); }
     if (tranca.status !== TrancaStatus.NOVA && tranca.status !== TrancaStatus.EM_REPARO) { throw new Error('Tranca está com status inválido para inserir no totem'); } 
     if (tranca.status === TrancaStatus.EM_REPARO && tranca.funcionarioId !== funcionarioId) { throw new Error('Ação não permitida'); }
     
     const totem = await this.totemRepository.findById(totemId);
    if (!totem) { throw new Error('Totem não encontrado'); } 
    
    await this.trancaRepository.update(trancaId, { 
      status: TrancaStatus.LIVRE, totem: { id: totemId }, }); 
      
      return { message: 'Tranca inserida!' };
    }
  }