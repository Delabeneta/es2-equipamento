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
import { Opcao, RetirarTrancaDto } from './dto/retirar-tranca.dto';
import { EmailService } from 'src/common/utils/email.service';

@Injectable()
export class TrancasService {
  constructor(
    @Inject('TrancaRepository')
    private readonly trancaRepository: TrancaRepository,
    @Inject('TotemRepository')
    private readonly totemRepository: TotemRepository,
    @Inject('BicicletaRepository')
    private readonly bicicletaRepository: BicicletaRepository,
    private readonly emailService: EmailService,
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
        AppErrorType.RESOURCE_CONFLICT,
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
  }

  async retirarDoTotem({ idTranca, idFuncionario, opcao }: RetirarTrancaDto) {
    const tranca = await this.validarTranca(idTranca);

    if (tranca.status !== TrancaStatus.REPARO_SOLICITADO) {
      throw new AppError(
        'Tranca está com status inválido para retirar do totem',
        AppErrorType.RESOURCE_CONFLICT,
      );
    }
    tranca.funcionarioId = idFuncionario;

    if (opcao === Opcao.EM_REPARO) {
      await this.trancaRepository.update(idTranca, {
        status: TrancaStatus.EM_REPARO,
      });
    } else if (opcao === Opcao.APOSENTADORIA) {
      await this.trancaRepository.update(idTranca, {
        status: TrancaStatus.APOSENTADA,
      });
    } else {
      throw new AppError(
        'Opcao invalida para retirada da tranca',
        AppErrorType.RESOURCE_CONFLICT,
      );
    }

    await this.trancaRepository.update(idTranca, {
      status: TrancaStatus.LIVRE,
      totem: null,
    });

    const dataHoraRetirada = new Date().toISOString();

    const logInsercao = {
      dataHoraInsercao: new Date().toISOString(),
      idTranca,
      idFuncionario,
    };
    await this.trancaRepository.saveLogInsercao(idTranca, logInsercao);

    const emailResponse = await this.emailService.sendEmail(
      'supervisor@equipamento.com',
      'Retirada de Tranca',
      `A tranca de número ${idTranca} foi retirada para ${opcao}.
    Data/Hora: ${dataHoraRetirada}
    Funcionario: ${idFuncionario}`,
    );
    return `Resposta do envio de e-mail:' ${emailResponse}`;
  }
  async trancar({ idTranca, idBicicleta }: TrancamentoTrancaDto) {
    const tranca = await this.validarTranca(idTranca);

    if (tranca.status !== TrancaStatus.LIVRE) {
      throw new AppError(
        'A tranca está com status inválido para ser trancada',
        AppErrorType.RESOURCE_CONFLICT,
      );
    }

    if (idBicicleta) {
      await this.validarBicicleta(idBicicleta);

      await this.bicicletaRepository.update(idBicicleta, {
        status: BicicletaStatus.DISPONIVEL,
      });
    }

    await this.trancaRepository.update(idTranca, {
      status: TrancaStatus.OCUPADA,
      bicicleta: { id: idBicicleta },
    });
  }

  async destrancar({ idTranca, idBicicleta }: TrancamentoTrancaDto) {
    const tranca = await this.validarTranca(idTranca);

    if (tranca.status !== TrancaStatus.OCUPADA) {
      throw new AppError(
        'A tranca nao está ocupada e nao pode ser destrancada.',
        AppErrorType.RESOURCE_CONFLICT,
      );
    }

    if (idBicicleta) {
      const bicicleta = await this.validarBicicleta(idBicicleta);

      if (bicicleta.trancaId !== tranca.id) {
        throw new AppError(
          'A bicicleta nao está associada a esta tranca.',
          AppErrorType.RESOURCE_CONFLICT,
        );
      }

      await this.bicicletaRepository.update(idBicicleta, {
        status: BicicletaStatus.EM_USO,
      });
    }

    await this.trancaRepository.update(idTranca, {
      status: TrancaStatus.LIVRE,
      bicicleta: null,
    });
  }

  // ========================
  // Métodos Auxiliares
  // ========================

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
