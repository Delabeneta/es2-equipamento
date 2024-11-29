/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateTrancaDto } from './dto/create-Tranca.dto';
import { UpdateTrancaDto } from './dto/update-Tranca.dto';
import { Tranca } from './entities/tranca.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

//  @InjectRepository é usado para injetar um repositório
// associado a uma entidade diretamente no serviço.

// Posso usar métodos sem precisar instanciar o repósito manualmente
// Um repositorio atua como uma camada de abstração, 
// entre o codigo e o BD  faacilitando realiar o CRUD


@Injectable()
export class TrancasService {
  constructor( 
      @InjectRepository(Tranca)
      private trancaRepository: Repository<Tranca>,
  ) {}

  create(createTrancaDto: CreateTrancaDto) {
    return this.trancaRepository.save(createTrancaDto);
  } // 

  findAll() {
    return `This action returns all Tranca`;
  }

  findOne(id: number) {
    return `This action returns a #${id} Tranca`;
  }

  update(id: number, updateTrancaDto: UpdateTrancaDto) {
    return `This action updates a #${id} Tranca`;
  }

  remove(id: number) {
    return `This action removes a #${id} Tranca`;
  }
}
