import { Inject, Injectable } from '@nestjs/common';
import { CreateBicicletaDto } from './dto/create-bicicleta.dto';
import { BicicletaRepository } from './domain/bicicleta.repository';
import { generateRandomNumber } from 'src/common/utils/random-number';
import { BicicletaStatus } from './domain/bicicleta';
import { UpdateBicicletaDto } from './dto/update-bicicleta.dto';
import { TrancaRepository } from 'src/trancas/domain/tranca.repository';
import { TrancaStatus } from 'src/trancas/domain/tranca';
import { IncludeBicicletaOnTrancaDto } from './dto/include-bicicleta-on-tranca.dto';
import { BicicletaEntity } from './domain/bicicleta.entity';
import { EmailService } from 'src/common/utils/email.service';
import { RetirarBicicletaDaTrancaDto } from './dto/retirar-bicicleta-on-tranca';
import { AppError, AppErrorType } from 'src/common/domain/app-error';

@Injectable()
export class BicicletasService {
  constructor(
    @Inject('BicicletaRepository')
    private readonly bicicletaRepository: BicicletaRepository,
    @Inject('TrancaRepository')
    private readonly trancaRepository: TrancaRepository,
    private readonly emailService: EmailService,
  ) {}

  // *********************
  ///    MÉTODOS CRUD
  // *********************

  async create(createBicicletaDto: CreateBicicletaDto) {
    const bicicletaNumero = generateRandomNumber();
    const bicicletaStatus = BicicletaStatus.NOVA;

    const createdBicicleta = await this.bicicletaRepository.create({
      ...createBicicletaDto,
      status: bicicletaStatus,
      numero: bicicletaNumero,
    });

    return BicicletaEntity.toDomain(createdBicicleta);
  }
  async delete(idBicicleta: number) {
    const bicicleta = await this.validarBicicleta(idBicicleta);

    if (bicicleta.status !== BicicletaStatus.APOSENTADA) {
      throw new AppError(
        'Apenas bicicletas aposentadas podem ser excluídas',
        AppErrorType.RESOURCE_CONFLICT,
      );
    }

    return this.bicicletaRepository.delete(idBicicleta);
  }

  async update(idBicicleta: number, updateBicicletaDto: UpdateBicicletaDto) {
    await this.validarBicicleta(idBicicleta);

    const updatedBicicleta = await this.bicicletaRepository.update(
      idBicicleta,
      updateBicicletaDto,
    );

    return BicicletaEntity.toDomain(updatedBicicleta);
  }
  async findAll() {
    const bicicletas = await this.bicicletaRepository.findAll();
    return bicicletas.map((bicicleta) => BicicletaEntity.toDomain(bicicleta));
  }
  async findById(id: number) {
    const bicicletaEntity = await this.bicicletaRepository.findById(id);
    if (!bicicletaEntity) {
      throw new AppError(
        'Bicicleta nao encontrada',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }
    return BicicletaEntity.toDomain(bicicletaEntity);
  }

  // *********************
  /// MÉTODOS DE NEGÓCIO
  // *********************

  async incluirBicicletaNaRede({
    idBicicleta,
    idTranca,
    idFuncionario,
  }: IncludeBicicletaOnTrancaDto) {
    const bicicleta = await this.validarBicicleta(idBicicleta);
    this.verificarStatusBicicletaParaInclusao(bicicleta, idFuncionario);

    const tranca = await this.validarTranca(idTranca);

    if (tranca.status !== TrancaStatus.LIVRE) {
      throw new AppError(
        'Tranca nao está disponível',
        AppErrorType.RESOURCE_CONFLICT,
      );
    }

    const dataHoraInsercao = new Date().toISOString();

    await this.bicicletaRepository.saveLogInsercao(idBicicleta, {
      dataHoraInsercao,
      idTranca,
    });

    await this.bicicletaRepository.update(idBicicleta, {
      status: BicicletaStatus.DISPONIVEL,
    });

    await this.trancaRepository.update(idTranca, {
      status: TrancaStatus.OCUPADA,
      bicicleta: { id: bicicleta.id },
    });

    await this.emailService.sendEmail(
      'reparador@equipamento.com',
      'Inclusao de Bicicleta',
      `A bicicleta de número ${idBicicleta} foi incluida.\nData/Hora: ${dataHoraInsercao}`,
    );
  }

  async retirarBicicletaDaRede({
    idBicicleta,
    idTranca,
    idFuncionario,
    opcao,
  }: RetirarBicicletaDaTrancaDto) {
    const bicicleta = await this.validarBicicleta(idBicicleta);

    if (bicicleta.status !== BicicletaStatus.REPARO_SOLICITADO) {
      throw new AppError(
        'Bicicleta está com status inválido para retirar do totem',
        AppErrorType.RESOURCE_CONFLICT,
      );
    }

    const tranca = await this.validarTranca(idTranca);

    if (
      tranca.status !== TrancaStatus.OCUPADA ||
      tranca.bicicletaId !== idBicicleta
    ) {
      throw new AppError(
        'Tranca ou bicicleta estão em status inválido',
        AppErrorType.RESOURCE_CONFLICT,
      );
    }

    await this.trancaRepository.update(idTranca, {
      status: TrancaStatus.LIVRE,
      bicicleta: null,
    });

    bicicleta.funcionarioId = idFuncionario;

    await this.BicicletaStatusUpdate(bicicleta.id, idFuncionario, opcao);

    const dataHoraRetirada = new Date().toISOString();

    await this.bicicletaRepository.saveLogInsercao(idBicicleta, {
      dataHoraInsercao: dataHoraRetirada,
      idTranca,
    });

    return this.emailService.sendEmail(
      'reparador@equipamento.com',
      'Retirada de Bicicleta',
      `A bicicleta de número ${idBicicleta} foi retirada para ${opcao}.
      Data/Hora: ${dataHoraRetirada}`,
    );
  }

  async changeStatus(idBicicleta: number, acao: string) {
    await this.validarBicicleta(idBicicleta);

    const novoStatus = this.ActionToBicicletaStatus(acao);

    await this.bicicletaRepository.update(idBicicleta, { status: novoStatus });

    return { id: idBicicleta, status: novoStatus };
  }

  // Métodos Auxiliares

  public async validarBicicleta(idBicicleta: number) {
    const bicicleta = await this.bicicletaRepository.findById(idBicicleta);
    if (!bicicleta) {
      throw new AppError(
        'Bicicleta nao encontrada',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }
    return bicicleta;
  }

  public async validarTranca(idTranca: number) {
    const tranca = await this.trancaRepository.findById(idTranca);
    if (!tranca) {
      throw new AppError(
        'Tranca nao encontrada',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }
    return tranca;
  }

  private verificarStatusBicicletaParaInclusao(
    bicicleta: BicicletaEntity,
    idFuncionario: number,
  ) {
    if (
      bicicleta.status !== BicicletaStatus.NOVA &&
      bicicleta.status !== BicicletaStatus.EM_REPARO
    ) {
      throw new AppError(
        'Bicicleta está com status inválido para inserir no totem',
        AppErrorType.RESOURCE_CONFLICT,
      );
    }

    if (
      bicicleta.status === BicicletaStatus.EM_REPARO &&
      bicicleta.funcionarioId !== idFuncionario
    ) {
      throw new AppError(
        'Funcionário nao é o mesmo que a retirou',
        AppErrorType.RESOURCE_CONFLICT,
      );
    }
  }

  private async BicicletaStatusUpdate(
    idBicicleta: number,
    idFuncionario: number,
    opcao: string,
  ) {
    const statusMap = {
      REPARO: BicicletaStatus.EM_REPARO,
      APOSENTADORIA: BicicletaStatus.APOSENTADA,
    };

    const acaoDoRepador = statusMap[opcao];

    if (!acaoDoRepador) {
      throw new AppError(
        'Opçao inválida para retirada da bicicleta',
        AppErrorType.RESOURCE_CONFLICT,
      );
    }

    await this.bicicletaRepository.update(idBicicleta, {
      status: acaoDoRepador,
      funcionarioId: idFuncionario,
    });
  }

  private ActionToBicicletaStatus(acao: string): BicicletaStatus {
    const statusMap = {
      APOSENTAR: BicicletaStatus.APOSENTADA,
      EM_USO: BicicletaStatus.EM_USO,
      EM_REPARO: BicicletaStatus.EM_REPARO,
      DISPONIVEL: BicicletaStatus.DISPONIVEL,
      REPARO_SOLICITADO: BicicletaStatus.REPARO_SOLICITADO,
    };

    const novoStatus = statusMap[acao];

    if (!novoStatus) {
      throw new AppError(
        'Ação de status inválida',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }

    return novoStatus;
  }
}
