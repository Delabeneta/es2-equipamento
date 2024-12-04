import { Inject, Injectable } from '@nestjs/common';
import { CreateBicicletaDto } from './dto/create-bicicleta.dto';
import { BicicletaRepository } from './domain/bicicleta.repository';
import { generateRandomNumber } from 'src/utils/random-number';
import { BicicletaStatus } from './domain/bicicleta';
import { UpdateBicicletaDto } from './dto/update-bicicleta.dto';
import { TrancaRepository } from 'src/trancas/domain/tranca.repository';
import { TrancaStatus } from 'src/trancas/domain/tranca';
import { IncludeBicicletaOnTrancaDto } from './dto/include-bicicleta-on-tranca.dto';
import { BicicletaEntity } from './domain/bicicleta.entity';

@Injectable()
export class BicicletasService {
  constructor(
    @Inject('BicicletaRepository')
    private readonly bicicletaRepository: BicicletaRepository, //
    @Inject('TrancaRepository')
    private readonly trancaRepository: TrancaRepository,
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
        'Bicicleta está com Status inválido para inserir no totem',
      );
    }

    if (
      bicicleta.status === BicicletaStatus.EM_REPARO &&
      bicicleta.funcionarioId !== idFuncionario
    ) {
      throw new Error('Ação nao permitida');
    }

    // 4. Solicitar o fechamento da tranca.
    const tranca = await this.trancaRepository.findById(idTranca);
    if (!tranca) throw new Error('Tranca não encontrada');
    if (tranca.status !== TrancaStatus.LIVRE) {
      throw new Error('Tranca não está disponível');
    }

    await this.bicicletaRepository.update(idBicicleta, {
      status: BicicletaStatus.DISPONIVEL,
    });

    await this.trancaRepository.update(idTranca, {
      status: TrancaStatus.OCUPADA,
      bicicleta: { id: bicicleta.id },
    });
  }

  async changeStatus(idBicicleta: number, acao: string) {
    const bicicleta = await this.bicicletaRepository.findById(idBicicleta);
    if (!bicicleta) {
      throw new Error('Bicicleta não encontrada');
    }
    switch (acao.toLowerCase()) {
      case 'aposentar':
        bicicleta.status = BicicletaStatus.APOSENTADA;
        break;
      case 'em_uso':
        bicicleta.status = BicicletaStatus.EM_USO;
        break;
      case 'em_reparo':
        bicicleta.status = BicicletaStatus.EM_REPARO;
        break;
      case 'disponivel':
        bicicleta.status = BicicletaStatus.DISPONIVEL;
        break;
      default:
        throw new Error('Ação de status inválida');
    }
    const updatedBicicleta = await this.bicicletaRepository.update(
      idBicicleta,
      bicicleta,
    );
    return updatedBicicleta;
  }
}
