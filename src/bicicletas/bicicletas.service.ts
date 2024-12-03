import { Inject, Injectable } from '@nestjs/common';
import { CreateBicicletaDto } from './dto/create-bicicleta.dto';
import { BicicletaRepository } from './domain/bicicleta.repository';
import { generateRandomNumber } from 'src/utils/random-number';
import { BicicletaStatus } from './domain/bicicleta';
import { UpdateBicicletaDto } from './dto/update-bicicleta.dto';
import { TrancaRepository } from 'src/trancas/domain/tranca.repository';
import { TrancaStatus } from 'src/trancas/domain/tranca';
import { IncludeBicicletaOnTrancaDto } from './dto/include-bicicleta-on-tranca.dto';

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
  findAll() {
    return this.bicicletaRepository.findAll();
  }

  async update(idBicicleta: number, updateBicicletaDto: UpdateBicicletaDto) {
    const bicicleta = await this.bicicletaRepository.findById(idBicicleta);
    if (!bicicleta) {
      throw new Error('Bicicleta nao encontrada');
    }
    return this.bicicletaRepository.update(idBicicleta, updateBicicletaDto);
  }

  // criar uma bicicleta
  create(createBicicletaDto: CreateBicicletaDto) {
    const bicicletaNumero = generateRandomNumber();
    const bicicletaStatus = BicicletaStatus.NOVA;

    return this.bicicletaRepository.create({
      ano: createBicicletaDto.ano,
      marca: createBicicletaDto.marca,
      status: bicicletaStatus,
      modelo: createBicicletaDto.modelo,
      numero: bicicletaNumero,
    });
  }

  async incluirBicicletaNaRede({
    idBicicleta,
    idFuncionario,
    idTranca,
  }: IncludeBicicletaOnTrancaDto) {
    const bicicleta = await this.bicicletaRepository.findById(idBicicleta);

    if (!bicicleta) {
      throw new Error('Bicicleta nao encontrada');
    } // validar numero da bicicleta

    if (
      bicicleta.status !== BicicletaStatus.NOVA &&
      bicicleta.status !== BicicletaStatus.EM_REPARO
    ) {
      throw new Error(
        'Bicicleta está com Status inválido para inserir no totem',
      );
    }

    if (bicicleta.status === BicicletaStatus.EM_REPARO) {
    }

    // validar status. Se estiver EM_Reparo, precisa verificar o reparador que
    // retirou, é o mesmo que está devolvendo

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

    return { message: 'bicicleta inserida!' };
  }
}
