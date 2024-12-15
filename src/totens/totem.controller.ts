import { Controller, Delete, Get, Post, Param, Body } from '@nestjs/common';
import { TotemService } from './totem.service';
import { CreateTotemDto } from './dto/create-totem.dto';
import { TrancaEntity } from 'src/trancas/domain/tranca.entity';
import { BicicletaEntity } from 'src/bicicletas/domain/bicicleta.entity';

@Controller('totem')
export class TotemController {
  constructor(private readonly totemService: TotemService) {}

  @Post()
  create(@Body() createTotemDto: CreateTotemDto) {
    return this.totemService.create(createTotemDto);
  }

  @Get()
  findAll() {
    return this.totemService.findAll();
  }

  @Delete(':idTotem')
  async delete(@Param('idTotem') idTotem: number) {
    return this.totemService.delete(idTotem);
  }

  @Get(':id/trancas') async getTrancasByTotem(
    @Param('id') id: number,
  ): Promise<TrancaEntity[]> {
    return this.totemService.listarTrancas(id);
  }
  @Get(':id/bicicletas') async getBicicletasByTotem(
    @Param('id') id: number,
  ): Promise<BicicletaEntity[]> {
    return this.totemService.listarBicicletas(id);
  }
}
