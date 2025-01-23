import { Inject, Injectable } from '@nestjs/common';
import { CreateTrancaDto } from '../trancas/dto/create-tranca.dto';
import { UpdateTrancaDto } from '../trancas/dto/update-tranca.dto';
import { Tranca, TrancaStatus } from '../trancas/domain/tranca';
import { TrancaRepository } from '../trancas/domain/tranca.repository';
import { TrancaEntity } from './domain/tranca.entity';
import { IncluirTrancaDto } from './dto/incluir-tranca.dto';
import { TotemRepository } from 'src/totens/domain/totem.repository';
import { generateRandomNumber } from 'src/common/utils/random-number';
import { BicicletaRepository } from 'src/bicicletas/domain/bicicleta.repository';
import { BicicletaStatus } from 'src/bicicletas/domain/bicicleta';
import { AppError, AppErrorType } from 'src/common/domain/app-error';
import {
  RetirarTrancaDto,
  StatusAcaoReparador,
} from './dto/retirar-tranca.dto';
import { ExternoService } from 'src/common/utils/externo.service';

@Injectable()
export class TrancasService {
  constructor(
    @Inject('TrancaRepository')
    private readonly trancaRepository: TrancaRepository,
    @Inject('TotemRepository')
    private readonly totemRepository: TotemRepository,
    @Inject('BicicletaRepository')
    private readonly bicicletaRepository: BicicletaRepository,
    private readonly externoService: ExternoService,
  ) {}

  // ========================
  // Métodos CRUD
  // ========================

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
  async delete(idTranca: number) {
    const trancaExistente = await this.trancaRepository.findById(idTranca);
    if (!trancaExistente) {
      throw new AppError(
        'Tranca nao encontrada',
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

  async findById(id: number) {
    const trancaEntity = await this.trancaRepository.findById(id);
    if (!trancaEntity) {
      throw new AppError(
        'Tranca nao encontrada',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }
    return TrancaEntity.toDomain(trancaEntity);
  }

  async update(idTranca: number, updateTrancaDto: UpdateTrancaDto) {
    const trancaExistente = await this.trancaRepository.findById(idTranca);
    if (!trancaExistente) {
      throw new AppError(
        'Tranca nao encontrada',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }
    const updatedTranca = await this.trancaRepository.update(
      idTranca,
      updateTrancaDto,
    );
    return TrancaEntity.toDomain(updatedTranca);
  }

  // ========================
  // Métodos de Negócio
  // ========================

  async incluirNoTotem({ idTranca, idTotem, idFuncionario }: IncluirTrancaDto) {
    const tranca = await this.validarTranca(idTranca);

    if (
      tranca.status !== TrancaStatus.NOVA &&
      tranca.status !== TrancaStatus.EM_REPARO
    ) {
      throw new AppError(
        'Tranca está com status inválido para inserir no totem',
        AppErrorType.RESOURCE_INVALID,
      );
    }

    if (
      tranca.status === TrancaStatus.EM_REPARO &&
      tranca.funcionarioId !== idFuncionario
    ) {
      throw new AppError('Ação nao permitida', AppErrorType.RESOURCE_CONFLICT);
    }

    await this.validarTotem(idTotem);

    await this.trancaRepository.update(idTranca, {
      status: TrancaStatus.LIVRE,
      totem: { id: idTotem },
    });

    // const dataHoraInsercao = new Date().toISOString();

    await this.externoService.sendEmail(
      'supervisor@equipamento.com',
      'Inclusão de Tranca',
      `A tranca de número ${idTranca} foi incluída`,
    );

    return 'tranca foi incluída com sucesso';
  }

  async retirarDoTotem({
    idTranca,
    idFuncionario,
    statusAcaoReparador,
  }: RetirarTrancaDto) {
    const tranca = await this.validarTranca(idTranca);

    if (tranca.status !== TrancaStatus.REPARO_SOLICITADO) {
      throw new AppError(
        'Tranca está com status inválido para retirar do totem',
        AppErrorType.RESOURCE_CONFLICT,
      );
    }
    tranca.funcionarioId = idFuncionario;

    if (statusAcaoReparador === StatusAcaoReparador.EM_REPARO) {
      await this.trancaRepository.update(idTranca, {
        status: TrancaStatus.EM_REPARO,
        totem: null,
      });
    } else if (statusAcaoReparador === StatusAcaoReparador.APOSENTADORIA) {
      await this.trancaRepository.update(idTranca, {
        status: TrancaStatus.APOSENTADA,
        totem: null,
      });
    } else {
      throw new AppError(
        'Opcao invalida para retirada da tranca',
        AppErrorType.RESOURCE_INVALID,
      );
    }

    const dataHoraInsercao = new Date().toISOString();

    const logInsercao = {
      dataHoraInsercao,
      idTranca,
      idFuncionario,
    };
    await this.trancaRepository.saveLogInsercao(idTranca, logInsercao);

    await this.externoService.sendEmail(
      'supervisor@equipamento.com',
      'Retirada da Tranca',
      `A tranca de número ${idTranca} foi retirada para ${statusAcaoReparador}`,
    );
  }
  async trancar({
    idTranca,
    idBicicleta,
  }: {
    idTranca: number;
    idBicicleta?: number;
  }) {
    const tranca = await this.validarTranca(idTranca);

    if (
      tranca.status !== TrancaStatus.NOVA &&
      tranca.status !== TrancaStatus.EM_REPARO
    ) {
      throw new AppError(
        'A tranca está com status inválido para ser trancada',
        AppErrorType.RESOURCE_INVALID,
      );
    }

    if (idBicicleta) {
      await this.validarBicicleta(idBicicleta);

      await this.bicicletaRepository.update(idBicicleta, {
        status: BicicletaStatus.DISPONIVEL,
      });

      await this.trancaRepository.update(idTranca, {
        status: TrancaStatus.OCUPADA,
        bicicleta: { id: idBicicleta },
      });
    } else {
      // Se o idBicicleta não for fornecido, apenas tranca sem associar bicicleta
      await this.trancaRepository.update(idTranca, {
        status: TrancaStatus.OCUPADA,
        bicicleta: null, // Ou se a associação for nula
      });
    }
  }

  async destrancar({
    idTranca,
    idBicicleta,
  }: {
    idTranca: number;
    idBicicleta?: number;
  }) {
    const tranca = await this.validarTranca(idTranca);

    if (tranca.status !== TrancaStatus.OCUPADA) {
      throw new AppError(
        'A tranca nao está ocupada e nao pode ser destrancada.',
        AppErrorType.RESOURCE_CONFLICT,
      );
    }

    // Se foi fornecido o idBicicleta, podemos validar e garantir que a bicicleta está associada à tranca
    if (idBicicleta) {
      const bicicleta = await this.validarBicicleta(idBicicleta);

      if (bicicleta.status !== BicicletaStatus.DISPONIVEL) {
        throw new AppError(
          'A bicicleta não pode ser removida da tranca, pois não está disponível',
          AppErrorType.RESOURCE_INVALID,
        );
      }

      // Remove a associação da bicicleta com a tranca
      await this.trancaRepository.update(idTranca, {
        status: TrancaStatus.LIVRE,
        bicicleta: null, // Removendo a associação da bicicleta
      });

      // Atualiza a bicicleta, caso necessário
      await this.bicicletaRepository.update(idBicicleta, {
        status: BicicletaStatus.EM_USO, // Ou o status que faz sentido para a bicicleta
      });
    } else {
      // Se não forneceu idBicicleta, apenas destranca a tranca
      await this.trancaRepository.update(idTranca, {
        status: TrancaStatus.LIVRE,
        bicicleta: null, // Garantindo que a tranca está livre
      });
    }
  }

  async changeStatus(idTranca: number, acao: string) {
    await this.validarTranca(idTranca);

    const novoStatus = this.ActionToTrancaStatus(acao);

    await this.bicicletaRepository.update(idTranca, { status: novoStatus });

    return { id: idTranca, status: novoStatus };
  }

  // ========================
  // Métodos Auxiliares
  // ========================

  ActionToTrancaStatus(acao: string): BicicletaStatus {
    const statusMap = {
      LIVRE: TrancaStatus.LIVRE,
      OCUPADA: TrancaStatus.OCUPADA,
      EM_REPARO: TrancaStatus.EM_REPARO,
      APOSENTAR: TrancaStatus.APOSENTADA,
      REPARO_SOLICITADO: TrancaStatus.REPARO_SOLICITADO,
    };

    const novoStatus = statusMap[acao];

    if (!novoStatus) {
      throw new AppError(
        'Ação de status inválida',
        AppErrorType.RESOURCE_INVALID,
      );
    }

    return novoStatus;
  }

  async validarTranca(idTranca: number) {
    const tranca = await this.trancaRepository.findById(idTranca);
    if (!tranca) {
      throw new AppError(
        'Tranca nao encontrada',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }
    return tranca;
  }

  async validarTotem(idTotem: number) {
    const totem = await this.totemRepository.findById(idTotem);
    if (!totem) {
      throw new AppError(
        'Totem nao encontrado',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }
    return totem;
  }

  async validarBicicleta(idBicicleta: number) {
    const bicicleta = await this.bicicletaRepository.findById(idBicicleta);
    if (!bicicleta) {
      throw new AppError(
        'Bicicleta nao encontrada',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }
    return bicicleta;
  }
}
