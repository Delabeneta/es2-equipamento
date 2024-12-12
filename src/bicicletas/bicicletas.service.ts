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

@Injectable()
export class BicicletasService {
  constructor(
    @Inject('BicicletaRepository')
    private readonly bicicletaRepository: BicicletaRepository,
    @Inject('TrancaRepository')
    private readonly trancaRepository: TrancaRepository,
    private readonly emailService: EmailService,
  ) {}

  async delete(idBicicleta: number) {
    const bicicleta = await this.bicicletaRepository.findById(idBicicleta);
    if (!bicicleta) {
      throw new Error('Bicicleta nao encontrada');
    }

    if (bicicleta.status !== BicicletaStatus.APOSENTADA) {
      throw new Error('Apenas bicicletas aposentadas podem ser excluídas');
    }

    return this.bicicletaRepository.delete(idBicicleta);
  }

  async findById(id: number) {
    const bicicletaEntity = await this.bicicletaRepository.findById(id);
    if (!bicicletaEntity) {
      throw new Error('Bicicleta não encontrada');
    }
    return BicicletaEntity.toDomain(bicicletaEntity);
  }

  async findAll() {
    const bicicletas = await this.bicicletaRepository.findAll();
    return bicicletas.map((bicicleta) => BicicletaEntity.toDomain(bicicleta));
  }

  async update(idBicicleta: number, updateBicicletaDto: UpdateBicicletaDto) {
    const bicicleta = await this.bicicletaRepository.findById(idBicicleta);
    if (!bicicleta) {
      throw new Error('Bicicleta nao encontrada');
    }

    const updatedBicicleta = await this.bicicletaRepository.update(
      idBicicleta,
      updateBicicletaDto,
    );

    return BicicletaEntity.toDomain(updatedBicicleta);
  }

  async create(createBicicletaDto: CreateBicicletaDto) {
    const bicicletaNumero = generateRandomNumber();
    const bicicletaStatus = BicicletaStatus.NOVA;

    const createdBicicleta = await this.bicicletaRepository.create({
      ano: createBicicletaDto.ano,
      marca: createBicicletaDto.marca,
      status: bicicletaStatus,
      modelo: createBicicletaDto.modelo,
      numero: bicicletaNumero,
    });

    return BicicletaEntity.toDomain(createdBicicleta);
  }

  async incluirBicicletaNaRede({
    idBicicleta,
    idTranca,
    idFuncionario,
  }: IncludeBicicletaOnTrancaDto) {
    const bicicleta = await this.bicicletaRepository.findById(idBicicleta);

    if (!bicicleta) {
      throw new Error('Bicicleta nao encontrada');
    }

    if (
      bicicleta.status !== BicicletaStatus.NOVA &&
      bicicleta.status !== BicicletaStatus.EM_REPARO
    ) {
      throw new Error(
        'Bicicleta está com status inválido para inserir no totem',
      );
    }

    if (
      bicicleta.status === BicicletaStatus.EM_REPARO &&
      bicicleta.funcionarioId !== idFuncionario
    ) {
      throw new Error('Funcionário não é o mesmo que a retirou');
    }

    const tranca = await this.trancaRepository.findById(idTranca);
    if (!tranca) throw new Error('Tranca não encontrada');

    if (tranca.status !== TrancaStatus.LIVRE) {
      throw new Error('Tranca não está disponível');
    }

    const dataHoraInsercao = new Date().toISOString();

    const logInsercao = {
      dataHoraInsercao,
      idBicicleta,
      idTranca,
      idFuncionario,
    };

    await this.bicicletaRepository.saveLogInsercao(idBicicleta, logInsercao);

    await this.bicicletaRepository.update(idBicicleta, {
      status: BicicletaStatus.DISPONIVEL,
    });

    bicicleta.funcionarioId = idFuncionario;

    await this.trancaRepository.update(idTranca, {
      status: TrancaStatus.OCUPADA,
      bicicleta: { id: bicicleta.id },
    });

    await this.emailService.sendEmail(
      'reparador@equipamento.com',
      'Inclusao de Bicicleta',
      `A bicicleta de número ${idBicicleta} foi incluida.
      Data/Hora: ${dataHoraInsercao}`,
    );
  }

  async retirarBicicletaDaRede({
    idBicicleta,
    idTranca,
    idFuncionario,
    opcao,
  }: RetirarBicicletaDaTrancaDto) {
    const bicicleta = await this.bicicletaRepository.findById(idBicicleta);

    if (!bicicleta) {
      throw new Error('Bicicleta nao encontrada');
    }

    if (bicicleta.status !== BicicletaStatus.REPARO_SOLICITADO) {
      throw new Error(
        'Bicicleta está com status inválido para retirar do totem',
      );
    }

    const tranca = await this.trancaRepository.findById(idTranca);
    if (!tranca) {
      throw new Error('Tranca não encontrada');
    }

    if (
      tranca.status !== TrancaStatus.OCUPADA &&
      tranca.bicicletaId !== idBicicleta
    ) {
      throw new Error('Tranca ou bicicleta estão em status inválido');
    }

    await this.trancaRepository.update(idTranca, {
      status: TrancaStatus.LIVRE,
      bicicleta: null,
    });

    bicicleta.funcionarioId = idFuncionario;
    await this.bicicletaRepository.update(idBicicleta, {
      funcionarioId: idFuncionario,
    });

    if (opcao === 'REPARO') {
      await this.bicicletaRepository.update(idBicicleta, {
        status: BicicletaStatus.EM_REPARO,
      });
    } else if (opcao === 'APOSENTADORIA') {
      await this.bicicletaRepository.update(idBicicleta, {
        status: BicicletaStatus.APOSENTADA,
      });
    }

    const dataHoraRetirada = new Date().toISOString();

    const logInsercao = {
      dataHoraInsercao: new Date().toISOString(),
      idTranca,
      idFuncionario,
    };
    await this.bicicletaRepository.saveLogInsercao(idBicicleta, logInsercao);

    const emailResponse = await this.emailService.sendEmail(
      'reparador@equipamento.com',
      'Retirada de Bicicleta',
      `A bicicleta de número ${idBicicleta} foi retirada para ${opcao}.
      Data/Hora: ${dataHoraRetirada}
      Reparador: ${idFuncionario}`,
    );

    return `Resposta do envio de e-mail:' ${emailResponse}`;
  }

  async changeStatus(idBicicleta: number, acao: string) {
    const bicicleta = await this.bicicletaRepository.findById(idBicicleta);
    if (!bicicleta) {
      throw new Error('Bicicleta não encontrada');
    }

    let novoStatus;
    switch (acao) {
      case 'APOSENTAR':
        novoStatus = BicicletaStatus.APOSENTADA;
        break;
      case 'EM_USO':
        novoStatus = BicicletaStatus.EM_USO;
        break;
      case 'EM_REPARO':
        novoStatus = BicicletaStatus.EM_REPARO;
        break;
      case 'DISPONIVEL':
        novoStatus = BicicletaStatus.DISPONIVEL;
        break;
      case 'REPARO_SOLICITADO':
        novoStatus = BicicletaStatus.REPARO_SOLICITADO;
        break;
      default:
        throw new Error('Ação de status inválida');
    }

    await this.bicicletaRepository.update(idBicicleta, { status: novoStatus });

    return { id: idBicicleta, status: novoStatus };
  }
}
