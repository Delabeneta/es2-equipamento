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
import { RetirarBicicletaDaTrancaDto } from './dto/retirar-bicicleta-on-tranca';
import { AppError, AppErrorType } from 'src/common/domain/app-error';
import { ExternoService } from 'src/common/utils/externo.service';
import { AluguelService } from 'src/common/utils/aluguel.service';

@Injectable()
export class BicicletasService {
  constructor(
    @Inject('BicicletaRepository')
    private readonly bicicletaRepository: BicicletaRepository,
    @Inject('TrancaRepository')
    private readonly trancaRepository: TrancaRepository,
    private readonly externoService: ExternoService,
    private readonly aluguelService: AluguelService,
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

    const funcionario =
      await this.aluguelService.getFuncionarioById(idFuncionario);

    if (!funcionario) {
      throw new AppError(
        'Funcionario nao encontrado',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }

    const dataHoraInsercao = new Date().toISOString();

    // Registro da inclusão da bicicleta e atualização do status
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

    // Envio do e-mail

    await this.externoService.sendEmail(
      funcionario.email,
      'Inclusão de Bicicleta',
      `A bicicleta de número ${idBicicleta} foi incluída.\nData/Hora: ${dataHoraInsercao}`,
    );
  }

  async retirarBicicletaDaRede({
    idBicicleta,
    idTranca,
    idFuncionario,
    statusAcaoReparador,
  }: RetirarBicicletaDaTrancaDto) {
    const bicicleta = await this.validarBicicleta(idBicicleta);

    if (bicicleta.status !== BicicletaStatus.REPARO_SOLICITADO) {
      throw new AppError(
        'A bicicleta não está em estado de REPARO_SOLICITADO',
        AppErrorType.RESOURCE_INVALID,
      );
    }

    const tranca = await this.validarTranca(idTranca);

    if (
      tranca.status !== TrancaStatus.OCUPADA ||
      tranca.bicicletaId !== idBicicleta
    ) {
      throw new AppError(
        'Tranca não está ocupada para retirar a bicicleta',
        AppErrorType.RESOURCE_INVALID,
      );
    }

    const funcionario =
      await this.aluguelService.getFuncionarioById(idFuncionario);

    if (!funcionario) {
      throw new AppError(
        'Funcionario nao encontrado',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }

    await this.trancaRepository.update(idTranca, {
      status: TrancaStatus.LIVRE,
      bicicleta: null,
    });

    bicicleta.funcionarioId = idFuncionario;

    await this.BicicletaStatusUpdate(
      bicicleta.id,
      idFuncionario,
      statusAcaoReparador,
    );

    const dataHoraRetirada = new Date().toISOString();

    await this.bicicletaRepository.saveLogInsercao(idBicicleta, {
      dataHoraInsercao: dataHoraRetirada,
      idTranca,
    });
    await this.externoService.sendEmail(
      funcionario.email,
      'Retirada de Bicicleta',
      `A bicicleta de número ${idBicicleta} foi retirada para ${statusAcaoReparador}.`,
    );
  }
  async changeStatus(idBicicleta: number, acao: string) {
    await this.validarBicicleta(idBicicleta);

    const novoStatus = this.ActionToBicicletaStatus(acao);

    await this.bicicletaRepository.update(idBicicleta, { status: novoStatus });

    return { id: idBicicleta, status: novoStatus };
  }

  // Métodos Auxiliares

  private ActionToBicicletaStatus(acao: string): BicicletaStatus {
    const statusMap = {
      DISPONIVEL: BicicletaStatus.DISPONIVEL,
      EM_USO: BicicletaStatus.EM_USO,
      NOVA: BicicletaStatus.NOVA,
      APOSENTADA: BicicletaStatus.APOSENTADA,
      REPARO_SOLICITADO: BicicletaStatus.REPARO_SOLICITADO,
      EM_REPARO: BicicletaStatus.EM_REPARO,
    };

    const novoStatus = statusMap[acao];

    if (!novoStatus) {
      throw new AppError(
        'Ação de status inválida',
        AppErrorType.RESOURCE_INVALID, // Reflete 422
      );
    }

    return novoStatus;
  }

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
        AppErrorType.RESOURCE_INVALID,
      );
    }

    if (
      bicicleta.status === BicicletaStatus.EM_REPARO &&
      bicicleta.funcionarioId !== idFuncionario
    ) {
      throw new AppError(
        'Funcionario precisa ser o mesmo que retirou',
        AppErrorType.RESOURCE_CONFLICT,
      );
    }
  }
  // Status da ação de retirada da bicicleta
  private async BicicletaStatusUpdate(
    idBicicleta: number,
    idFuncionario: number,
    statusAcaoReparador: string,
  ) {
    const statusMap = {
      EM_REPARO: BicicletaStatus.EM_REPARO,
      APOSENTADA: BicicletaStatus.APOSENTADA,
    };

    const acaoDoRepador = statusMap[statusAcaoReparador];

    if (!acaoDoRepador) {
      throw new AppError(
        'Opçao inválida para retirada da bicicleta',
        AppErrorType.RESOURCE_INVALID,
      );
    }

    await this.bicicletaRepository.update(idBicicleta, {
      status: acaoDoRepador,
      funcionarioId: idFuncionario,
    });
  }
}
