import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Param,
  ParseIntPipe,
  Body,
  HttpCode,
} from '@nestjs/common';
import { TrancasService } from '../trancas/trancas.service';
import { CreateTrancaDto } from '../trancas/dto/create-tranca.dto';
import { UpdateTrancaDto } from '../trancas/dto/update-tranca.dto';
import { IncluirTrancaDto } from './dto/incluir-tranca.dto';
import { TrancamentoTrancaDto } from './dto/tracamento-tranca.dto';
import { Tranca } from './domain/tranca';
import { RetirarTrancaDto } from './dto/retirar-tranca.dto';

@Controller('/tranca')
export class TrancasController {
  constructor(private readonly trancasService: TrancasService) {}

  @Post('/')
  @HttpCode(200)
  create(@Body() createTrancaDto: CreateTrancaDto) {
    return this.trancasService.create(createTrancaDto);
  }

  @Put(':idTranca')
  update(
    @Param('idTranca', ParseIntPipe) idTranca: number,
    @Body() updateTrancaDto: UpdateTrancaDto,
  ) {
    return this.trancasService.update(idTranca, updateTrancaDto);
  }

  @Get()
  findAll() {
    return this.trancasService.findAll();
  }

  @Get(':idTranca')
  async findById(@Param('idTranca') idTranca: number): Promise<Tranca> {
    return await this.trancasService.findById(idTranca);
  }

  @Delete(':idTranca')
  async delete(@Param('idTranca') idTranca: number) {
    return this.trancasService.delete(idTranca);
  }
  // inserir tranca nova ou em reparo no totem

  @Post('/integrarNaRede')
  @HttpCode(200)
  async inserirNoTotem(@Body() incluirTrancaDto: IncluirTrancaDto) {
    return this.trancasService.incluirNoTotem(incluirTrancaDto);
  }
  @Post('/retirarDaRede')
  @HttpCode(200)
  async retirarDaRede(@Body() retirarTrancaDto: RetirarTrancaDto) {
    return this.trancasService.retirarDoTotem(retirarTrancaDto);
  }

  @Post(':idTranca/trancar')
  @HttpCode(200)
  async trancar(
    @Param('idTranca') idTranca: number,
    @Body() tracamentoTrancaDto: TrancamentoTrancaDto,
  ) {
    return this.trancasService.trancar({ idTranca, ...tracamentoTrancaDto });
  }

  @Post(':idTranca/destrancar')
  @HttpCode(200)
  async destrancar(
    @Param('idTranca') idTranca: number,
    @Body() tracamentoTrancaDto: TrancamentoTrancaDto,
  ) {
    return this.trancasService.destrancar({
      idTranca,
      idBicicleta: tracamentoTrancaDto.bicicleta,
    });
  }

  @Post(':idTranca/status/:acao')
  @HttpCode(200)
  async trocarStatus(
    @Param('idTranca', ParseIntPipe) idTranca: number,
    @Param('acao') acao: string,
  ) {
    return this.trancasService.changeStatus(idTranca, acao);
  }
}
