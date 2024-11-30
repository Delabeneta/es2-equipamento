import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBicicletaDto } from './dto/create-bicicleta.dto';
import { BicicletaRepository } from './domain/bicicleta.repository';
import { generateRandomNumber } from 'src/utils/random-number';
import { BicicletaStatus } from './domain/bicicleta';
import { UpdateBicicletaDto } from './dto/update-bicicleta.dto';

@Injectable()
export class BicicletasService {
  async delete(idBicicleta: number) {
    const bicicletaExistente =
      await this.bicicletaRepository.findById(idBicicleta);
    if (!bicicletaExistente) {
      throw new NotFoundException('Bicicleta nao encontrada');
    }
    return this.bicicletaRepository.delete(idBicicleta);
  }
  findAll() {
    return this.bicicletaRepository.findAll();
  }
  constructor(
    @Inject('BicicletaRepository')
    private readonly bicicletaRepository: BicicletaRepository, //
  ) {}

  async update(idBicicleta: number, updateBicicletaDto: UpdateBicicletaDto) {
    const bicicletaExistente =
      await this.bicicletaRepository.findById(idBicicleta);
    if (!bicicletaExistente) {
      throw new NotFoundException('Bicicleta nao encontrada');
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
