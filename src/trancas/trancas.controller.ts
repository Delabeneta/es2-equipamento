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

@Controller('Trancas')
export class TrancasController {
  constructor(private readonly trancasService: TrancasService) {}

  @Post()
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

  @Post('incluir-no-totem')
  async incluirNoTotem(@Body() incluirTrancaDto: IncluirTrancaDto) {
    return this.trancasService.incluirNoTotem(incluirTrancaDto);
  }
}
