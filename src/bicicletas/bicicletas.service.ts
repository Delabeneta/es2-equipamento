import { Injectable } from '@nestjs/common';
import { Bicicleta } from './entities/bicicleta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBicicletaDto } from './dto/create-bicicleta.dto'; // Importe o DTO

@Injectable()
export class BicicletasService {
  constructor(
    @InjectRepository(Bicicleta)
    private readonly bicicletaRepository: Repository<Bicicleta>, // Corrigido o nome do repositório
  ) {}

  // Método para criar uma bicicleta
  create(createBicicletaDto: CreateBicicletaDto) {
    return this.bicicletaRepository.save(createBicicletaDto);
  }
}
