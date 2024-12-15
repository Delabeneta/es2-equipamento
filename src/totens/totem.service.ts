import { Inject, Injectable } from '@nestjs/common';
import { TotemRepository } from './domain/totem.repository';
import { Totem } from './domain/totem';
import { CreateTotemDto } from './dto/create-totem.dto';
import { TotemEntity } from './domain/totem.entity';
import { TrancaRepository } from 'src/trancas/domain/tranca.repository';
import { TrancaEntity } from 'src/trancas/domain/tranca.entity';
import { BicicletaRepository } from 'src/bicicletas/domain/bicicleta.repository';
import { BicicletaEntity } from 'src/bicicletas/domain/bicicleta.entity';
import { AppError, AppErrorType } from 'src/common/domain/app-error';
import { Bicicleta } from 'src/bicicletas/domain/bicicleta';
import { Tranca } from 'src/trancas/domain/tranca';

@Injectable()
export class TotemService {
  constructor(
    @Inject('TotemRepository')
    private readonly totemRepository: TotemRepository,

    @Inject('TrancaRepository')
    private readonly trancaRepository: TrancaRepository,

    @Inject('BicicletaRepository')
    private readonly bicicletaRepository: BicicletaRepository,
  ) {}

  async delete(idTotem: number) {
    const totemExistente = await this.totemRepository.findById(idTotem);
    if (!totemExistente) {
      throw new AppError(
        'Totem não encontrada',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }
    // !(trancas[] == 0) = Há valores dentro do objetos.
    if (totemExistente.trancas.length > 0) {
      throw new AppError('Totem com trancas', AppErrorType.RESOURCE_CONFLICT);
    }

    return this.totemRepository.delete(idTotem);
  }

  async findAll(): Promise<Totem[]> {
    const totens = await this.totemRepository.findAll();
    return totens.map((totem) => TotemEntity.toDomain(totem));
  }

  async listarTrancas(totemId: number): Promise<Tranca[]> {
    const totem = await this.totemRepository.findById(totemId);
    if (!totem) {
      throw new AppError(
        'Totem não encontrado',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }
    const trancas = await this.totemRepository.findTrancasByTotemId(totemId);
    return trancas.map((tranca) => TrancaEntity.toDomain(tranca));
  }

  async listarBicicletas(totemId: number): Promise<Bicicleta[]> {
    const totem = await this.totemRepository.findById(totemId);
    if (!totem) {
      throw new AppError(
        'Totem não encontrado',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }
    const bicicletas =
      await this.totemRepository.findBicicletasByTotemId(totemId);
    return bicicletas.map((bicicleta) => BicicletaEntity.toDomain(bicicleta));
  }

  async create(createTotemDto: CreateTotemDto) {
    const createdTotem = await this.totemRepository.create({
      descricao: createTotemDto.descricao,
      localizacao: createTotemDto.localizacao,
    });
    return TotemEntity.toDomain(createdTotem);
  }
}
