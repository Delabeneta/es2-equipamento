import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  Post,
  Put,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { BicicletasService } from './bicicletas.service';
import { CreateBicicletaDto } from './dto/create-bicicleta.dto';
import { UpdateBicicletaDto } from './dto/update-bicicleta.dto';
import { IncludeBicicletaOnTrancaDto } from './dto/include-bicicleta-on-tranca.dto';
import { RetirarBicicletaDaTrancaDto } from './dto/retirar-bicicleta-on-tranca';
import { Bicicleta } from './domain/bicicleta';

@Controller('bicicleta')
export class BicicletasController {
  constructor(private readonly bicicletasService: BicicletasService) {}

  @Post()
  @HttpCode(200)
  create(@Body() createBicicletaDto: CreateBicicletaDto) {
    return this.bicicletasService.create(createBicicletaDto);
  }

  @Put(':idBicicleta')
  update(
    @Param('idBicicleta', ParseIntPipe) idBicicleta: number,
    @Body() updateBicicletaDto: UpdateBicicletaDto,
  ) {
    return this.bicicletasService.update(idBicicleta, updateBicicletaDto);
  }

  @Get(':idBicicleta')
  async findById(
    @Param('idBicicleta') idBicicleta: number,
  ): Promise<Bicicleta> {
    return await this.bicicletasService.findById(idBicicleta);
  }

  @Get()
  async findAll() {
    return this.bicicletasService.findAll();
  }

  @Delete(':idBicicleta')
  async delete(@Param('idBicicleta') idBicicleta: number) {
    return this.bicicletasService.delete(idBicicleta);
  }

  @Post(':idBicicleta/status/:acao')
  async trocarStatus(
    @Param('idBicicleta', ParseIntPipe) idBicicleta: number,
    @Param('acao') acao: string,
  ) {
    return this.bicicletasService.changeStatus(idBicicleta, acao);
  }

  @Post('/integrarNaRede')
  @HttpCode(200)
  async integrarNaRede(
    @Body() includeBicicletaOnTrancaDto: IncludeBicicletaOnTrancaDto,
  ) {
    return this.bicicletasService.incluirBicicletaNaRede(
      includeBicicletaOnTrancaDto,
    );
  }

  @Post('/retirarDaRede')
  async retirarDaRede(
    @Body() retirarBicicletaDaTrancaDto: RetirarBicicletaDaTrancaDto,
  ) {
    return this.bicicletasService.retirarBicicletaDaRede(
      retirarBicicletaDaTrancaDto,
    );
  }
}
