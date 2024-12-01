import { Inject, Injectable } from '@nestjs/common';
import { TotemRepository } from './domain/totem.repository';
import { Totem } from './domain/totem';
import { CreateTotemDto } from './dto/create-totem.dto';

//  @InjectRepository é usado para injetar um repositório
// associado a uma entidade diretamente no serviço.

// Posso usar métodos sem precisar instanciar o repósito manualmente
// Um repositorio atua como uma camada de abstração,
// entre o codigo e o BD  faacilitando realiar o CRUD

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
