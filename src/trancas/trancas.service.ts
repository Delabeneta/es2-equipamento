import { Inject, Injectable } from '@nestjs/common';
import { CreateTrancaDto } from '../trancas/dto/create-tranca.dto';
import { UpdateTrancaDto } from '../trancas/dto/update-tranca.dto';
import { Tranca, TrancaStatus } from '../trancas/domain/tranca';
import { TrancaRepository } from '../trancas/domain/tranca.repository';
import { TrancaEntity } from './domain/tranca.entity';
import { IncluirTrancaDto } from './dto/incluir-tranca.dto';
import { TotemRepository } from 'src/totens/domain/totem.repository';
import { generateRandomNumber } from 'src/common/utils/random-number';
import { TrancamentoTrancaDto } from './dto/tracamento-tranca.dto';
import { BicicletaRepository } from 'src/bicicletas/domain/bicicleta.repository';
import { BicicletaStatus } from 'src/bicicletas/domain/bicicleta';
import { AppError, AppErrorType } from 'src/common/domain/app-error';

@Injectable()
export class TrancasService {
  constructor(
    @Inject('TrancaRepository')
    private readonly trancaRepository: TrancaRepository,
    @Inject('TotemRepository')
    private readonly totemRepository: TotemRepository,
    @Inject('BicicletaRepository')
    private readonly bicicletaRepository: BicicletaRepository,
  ) {}

  async delete(idTranca: number) {
    const trancaExistente = await this.trancaRepository.findById(idTranca);
    if (!trancaExistente) {
      throw new AppError(
        'Tranca não encontrada',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }

    if (trancaExistente.status === TrancaStatus.OCUPADA) {
      throw new AppError(
        'Apenas Trancas sem bicicletas podem ser excluídas',
        AppErrorType.RESOURCE_CONFLICT,
      );
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
      throw new AppError(
        'Tranca não encontrada',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }
    const updatedTranca = await this.trancaRepository.update(
      idTranca,
      updateTrancaDto,
    );
    return TrancaEntity.toDomain(updatedTranca);
  }

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
      throw new AppError(
        'Tranca não encontrada',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }

    if (
      tranca.status !== TrancaStatus.NOVA &&
      tranca.status !== TrancaStatus.EM_REPARO
    ) {
      throw new AppError(
        'Tranca está com status inválido para inserir no totem',
        AppErrorType.RESOURCE_CONFLICT,
      );
    }

    if (
      tranca.status === TrancaStatus.EM_REPARO &&
      tranca.funcionarioId !== idFuncionario
    ) {
      throw new AppError('Ação não permitida', AppErrorType.RESOURCE_CONFLICT);
    }

    const totem = await this.totemRepository.findById(idTotem);
    if (!totem) {
      throw new AppError(
        'Totem não encontrado',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }

    await this.trancaRepository.update(idTranca, {
      status: TrancaStatus.LIVRE,
      totem: { id: idTotem },
    });
  }
  async destrancar({ idTranca, idBicicleta }: TrancamentoTrancaDto) {
    const tranca = await this.trancaRepository.findById(idTranca);

    if (!tranca) {
      throw new AppError(
        'Tranca não encontrada',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }

    // Valida se a tranca está ocupada
    if (tranca.status !== TrancaStatus.OCUPADA) {
      throw new Error('A tranca não está ocupada e não pode ser destrancada.');
    }
    // Caso receba um ID de bicicleta
    if (idBicicleta) {
      const bicicleta = await this.bicicletaRepository.findById(idBicicleta);

      if (!bicicleta) {
        throw new Error('Bicicleta não encontrada');
      }

      if (bicicleta.trancaId !== tranca.id) {
        throw new Error('A bicicleta não está associada a esta tranca.');
      }

      // Atualiza o status da bicicleta
      await this.bicicletaRepository.update(idBicicleta, {
        status: BicicletaStatus.EM_USO,
      });
    }

    await this.trancaRepository.update(idTranca, {
      status: TrancaStatus.LIVRE,
      bicicleta: null,
    });
  }
}
