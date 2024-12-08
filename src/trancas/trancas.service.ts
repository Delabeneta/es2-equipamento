import { Inject, Injectable } from '@nestjs/common';
import { CreateTrancaDto } from '../trancas/dto/create-tranca.dto';
import { UpdateTrancaDto } from '../trancas/dto/update-tranca.dto';
import { Tranca, TrancaStatus } from '../trancas/domain/tranca';
import { generateRandomNumber } from '../utils/random-number';
import { TrancaRepository } from '../trancas/domain/tranca.repository';
import { TrancaEntity } from './domain/tranca.entity';
import { IncluirTrancaDto } from './dto/incluir-tranca.dto';
import { TotemRepository } from 'src/totens/domain/totem.repository';

@Injectable()
export class TrancasService {
  constructor(
    @Inject('TrancaRepository')
    private readonly trancaRepository: TrancaRepository,
    @Inject('TotemRepository')
    private readonly totemRepository: TotemRepository,
  ) {}

  async delete(idTranca: number) {
    const trancaExistente = await this.trancaRepository.findById(idTranca);
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
    return trancas.map((tranca) => TrancaEntity.toDomain(tranca));
  }

  async update(idTranca: number, updateTrancaDto: UpdateTrancaDto) {
    const trancaExistente = await this.trancaRepository.findById(idTranca);
    if (!trancaExistente) {
      throw new Error('Tranca não encontrada');
    }
    const updatedTranca = await this.trancaRepository.update(
      idTranca,
      updateTrancaDto,
    );
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

  // tranca nova ou em reparo
  async incluirNoTotem({ idTranca, idTotem, idFuncionario }: IncluirTrancaDto) {
    const tranca = await this.trancaRepository.findById(idTranca);

    if (!tranca) {
      throw new Error('Tranca não encontrada');
    }

    console.log(tranca.status, 'texto');

    if (
      tranca.status !== TrancaStatus.NOVA &&
      tranca.status !== TrancaStatus.EM_REPARO
    ) {
      throw new Error('Tranca está com status inválido para inserir no totem');
    }

    if (
      tranca.status === TrancaStatus.EM_REPARO &&
      tranca.funcionarioId !== idFuncionario
    ) {
      throw new Error('Ação não permitida');
    }

    const totem = await this.totemRepository.findById(idTotem);
    if (!totem) {
      throw new Error('Totem não encontrado');
    }

    await this.trancaRepository.update(idTranca, {
      status: TrancaStatus.LIVRE,
      totem: { id: idTotem },
    });
  }
}
