/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import { Funcionario } from './entities/funcionario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

//  @InjectRepository é usado para injetar um repositório
// associado a uma entidade diretamente no serviço.

// Posso usar métodos sem precisar instanciar o repósito manualmente
// Um repositorio atua como uma camada de abstração, 
// entre o codigo e o BD  faacilitando realiar o CRUD


@Injectable()
export class FuncionariosService {
  constructor( 
      @InjectRepository(Funcionario)
      private funcionarioRepository: Repository<Funcionario>,
  ) {}

  create(createFuncionarioDto: CreateFuncionarioDto) {
    return this.funcionarioRepository.save(createFuncionarioDto);
  } // 

  findAll() {
    return `This action returns all funcionarios`;
  }

  findOne(id: number) {
    return `This action returns a #${id} funcionario`;
  }

  update(id: number, updateFuncionarioDto: UpdateFuncionarioDto) {
    return `This action updates a #${id} funcionario`;
  }

  remove(id: number) {
    return `This action removes a #${id} funcionario`;
  }
}
