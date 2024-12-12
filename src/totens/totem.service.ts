import { Inject, Injectable } from '@nestjs/common';
import { TotemRepository } from './domain/totem.repository';
import { Totem } from './domain/totem';
import { CreateTotemDto } from './dto/create-totem.dto';
import { TotemEntity } from './domain/totem.entity';
import { AppError, AppErrorType } from 'src/common/domain/app-error';

@Injectable()
export class TotemService {
  constructor(
    @Inject('TotemRepository')
    private readonly totemRepository: TotemRepository, //
  ) {}

  async delete(idTotem: number) {
    const totemExistente = await this.totemRepository.findById(idTotem);
    if (!totemExistente) {
      throw new AppError(
        'Totem não encontrada',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }
    return this.totemRepository.delete(idTotem);
  }

  async findAll(): Promise<Totem[]> {
    const totens = await this.totemRepository.findAll();
    return totens.map((totem) => TotemEntity.toDomain(totem));
  }

  async create(createTotemDto: CreateTotemDto) {
    const createdTotem = await this.totemRepository.create({
      descricao: createTotemDto.descricao,
      localizacao: createTotemDto.localizacao,
    });
    return TotemEntity.toDomain(createdTotem);
  }
}
