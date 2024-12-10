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
import { retirarBicicletaDaTrancaDto } from './dto/retirar-bicicleta-on-tranca';
import { EmailService } from 'src/common/utils/email.service';

@Injectable()
export class BicicletasService {
  constructor(
    @Inject('BicicletaRepository')
    private readonly bicicletaRepository: BicicletaRepository, //
    @Inject('TrancaRepository')
    private readonly trancaRepository: TrancaRepository,
    private readonly emailService: EmailService, // Injeção do EmailService
  ) {}
  async delete(idBicicleta: number) {
    const bicicleta = await this.bicicletaRepository.findById(idBicicleta);
    if (!bicicleta) {
      throw new Error('Bicicleta nao encontrada');
    }
    //// VOLTAR AQUIII

    if (bicicleta.status !== BicicletaStatus.APOSENTADA) {
      throw new Error('Apenas Bicicletas aposentadas podem ser excluidas');
    }
    return this.bicicletaRepository.delete(idBicicleta);
  }
  async findAll() {
    const ciclistas = await this.bicicletaRepository.findAll();
    return ciclistas.map((ciclista) => BicicletaEntity.toDomain(ciclista));
  }

  async update(idBicicleta: number, updateBicicletaDto: UpdateBicicletaDto) {
    const bicicleta = await this.bicicletaRepository.findById(idBicicleta);
    if (!bicicleta) {
      throw new Error('Bicicleta nao encontrada');
    }
    const updatedCiclista = await this.bicicletaRepository.update(
      idBicicleta,
      updateBicicletaDto,
    );
    return BicicletaEntity.toDomain(updatedCiclista);
  }

  // criar uma bicicleta
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

  // integrar bicicleta nova ou em reparo = UC08
  async incluirBicicletaNaRede({
    idBicicleta,
    idTranca,
    idFuncionario,
  }: IncludeBicicletaOnTrancaDto) {
    const bicicleta = await this.bicicletaRepository.findById(idBicicleta);

    const tranca = await this.trancaRepository.findById(idTranca);
    if (!tranca) throw new Error('Tranca não encontrada');
    if (tranca.status !== TrancaStatus.LIVRE) {
      throw new Error('Tranca não está disponível');
    }

    // 1. Lê e valida o numero da bicicleta
    if (!bicicleta) {
      throw new Error('Bicicleta nao encontrada');
    }

    if (
      bicicleta.status !== BicicletaStatus.NOVA &&
      bicicleta.status !== BicicletaStatus.EM_REPARO
    ) {
      throw new Error(
        'Bicicleta está com Status inválido para inserir no totem',
      );
    }

    if (
      bicicleta.status === BicicletaStatus.EM_REPARO &&
      bicicleta.funcionarioId !== idFuncionario
    ) {
      throw new Error('Funcionario nao é o mesmo que a retirou');
    }

    // Registra os dados da inclusão da bicicleta

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

    const emailResponse = await this.emailService.sendEmail(
      'reparador@equipamento.com',
      'Inclusão de Bicicleta na Rede de Totens',
      `A bicicleta de número ${idBicicleta} foi incluída na rede de totens. 
      Data/Hora: ${dataHoraInsercao} 
      Número da Tranca: ${idTranca} 
      Reparador: ${idFuncionario}`,
    );

    console.log(`Resposta do envio de e-mail: ${emailResponse}`);
  }

  async retirarBicicletaDaRede({
    idBicicleta,
    idTranca,
    idFuncionario,
    opcao,
  }: retirarBicicletaDaTrancaDto) {
    const bicicleta = await this.bicicletaRepository.findById(idBicicleta);

    if (!bicicleta) {
      throw new Error('Bicicleta nao encontrada');
    }

    if (bicicleta.status !== BicicletaStatus.REPARO_SOLICITADO) {
      throw new Error(
        'Bicicleta está com Status inválido para retirar do totem',
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

    // retirar tranca da bicicleta e mudar o status
    await this.trancaRepository.update(idTranca, {
      status: TrancaStatus.LIVRE,
      bicicleta: null,
    });

    bicicleta.funcionarioId = idFuncionario; // Salvar o ID do funcionário que retirou
    await this.bicicletaRepository.update(idBicicleta, {
      funcionarioId: idFuncionario,
    });

    if (opcao === 'REPARO') {
      await this.bicicletaRepository.update(idBicicleta, {
        status: BicicletaStatus.EM_REPARO,
      });
    } else if (opcao == 'APOSENTADORIA') {
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

    console.log(`Resposta do envio de e-mail: ${emailResponse}`);
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

    // Atualiza somente o campo status
    await this.bicicletaRepository.update(idBicicleta, { status: novoStatus });

    // Retorna o status atualizado
    return { id: idBicicleta, status: novoStatus };
  }
}
