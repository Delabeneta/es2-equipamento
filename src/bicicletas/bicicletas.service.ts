import { Inject, Injectable } from '@nestjs/common';
import { CreateBicicletaDto } from './dto/create-bicicleta.dto';
import { BicicletaRepository } from './domain/bicicleta.repository';
import { generateRandomNumber } from 'src/utils/random-number';
import { BicicletaStatus } from './domain/bicicleta';
import { UpdateBicicletaDto } from './dto/update-bicicleta.dto';

@Injectable()
export class BicicletasService {
  constructor(
    @Inject('BicicletaRepository')
    private readonly bicicletaRepository: BicicletaRepository, //
  ) {}

  async delete(idBicicleta: number) {
    const bicicletaExistente =
      await this.bicicletaRepository.findById(idBicicleta);
    if (!bicicletaExistente) {
      throw new Error('Bicicleta nao encontrada');
    }
    //// VOLTAR AQUIII

    if (bicicletaExistente.status !== BicicletaStatus.APOSENTADA) {
      throw new Error('Apenas Bicicletas aposentadas podem ser excluidas');
    }
    return this.bicicletaRepository.delete(idBicicleta);
  }
  findAll() {
    return this.bicicletaRepository.findAll();
  }

  async update(idBicicleta: number, updateBicicletaDto: UpdateBicicletaDto) {
    const bicicletaExistente =
      await this.bicicletaRepository.findById(idBicicleta);
    if (!bicicletaExistente) {
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
}
