/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TrancasService } from './trancas.service';
import { CreateTrancaDto } from './dto/create-tranca.dto';
import { UpdateTrancaDto } from './dto/update-tranca.dto';

@Controller('Trancas')
export class TrancasController {
  constructor(private readonly trancasService: TrancasService) {}

  @Post()
  create(@Body() createTrancaDto: CreateTrancaDto) {
    return this.trancasService.create(createTrancaDto);
  }

  @Get()
  findAll() {
    return this.trancasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trancasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTrancaDto: UpdateTrancaDto) {
    return this.trancasService.update(+id, updateTrancaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trancasService.remove(+id);
  }
}
