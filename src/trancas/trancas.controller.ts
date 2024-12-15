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

  @Delete(':idTranca')
  async delete(@Param('idTranca') idTranca: number) {
    return this.trancasService.delete(idTranca);
  }
  // inserir tranca nova ou em reparo no totem
  @Post('/integrarNaRede')
  async inserirNoTotem(@Body() incluirTrancaDto: IncluirTrancaDto) {
    return this.trancasService.incluirNoTotem(incluirTrancaDto);
  }

  @Post('/destrancar')
  async destrancar(@Body() tracamentoTrancaDto: TrancamentoTrancaDto) {
    return this.trancasService.destrancar(tracamentoTrancaDto);
  }
}
