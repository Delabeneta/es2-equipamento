import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Param,
  ParseIntPipe,
  Body,
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
  async inserirNoTotem(@Body() incluirTrancaDto: IncluirTrancaDto) {
    return this.trancasService.incluirNoTotem(incluirTrancaDto);
  }

  @Post('/retirarNaRede')
  async retirarDaRede(@Body() retirarTrancaDto: RetirarTrancaDto) {
    return this.trancasService.retirarDoTotem(retirarTrancaDto);
  }

  @Post('/destrancar')
  async destrancar(@Body() tracamentoTrancaDto: TrancamentoTrancaDto) {
    return this.trancasService.destrancar(tracamentoTrancaDto);
  }
  @Post('/trancar')
  async trancar(@Body() tracamentoTrancaDto: TrancamentoTrancaDto) {
    return this.trancasService.trancar(tracamentoTrancaDto);
  }
}
