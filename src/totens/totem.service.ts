import { Inject, Injectable } from '@nestjs/common';
import { TotemRepository } from './domain/totem.repository';
import { Totem } from './domain/totem';
import { CreateTotemDto } from './dto/create-totem.dto';

@Injectable()
export class TotemService {
  constructor(
    @Inject('TotemRepository')
    private readonly totemRepository: TotemRepository, //
  ) {}

  async delete(idTotem: number) {
    const totemExistente = await this.totemRepository.findById(idTotem);
    if (!totemExistente) {
      throw new Error('Totem não encontrada');
    }
    return this.totemRepository.delete(idTotem);
  }

  async findAll(): Promise<Totem[]> {
    const totems = await this.totemRepository.findAll();
    return totems;
  }

  create(createTotemDto: CreateTotemDto) {
    return this.totemRepository.create({
      descricao: createTotemDto.descricao,
      localizacao: createTotemDto.localizacao,
    });
  }
}
