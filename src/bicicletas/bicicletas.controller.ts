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

@Controller('bicicletas')
export class BicicletasController {
  constructor(private readonly bicicletasService: BicicletasService) {}

  @Post()
  @HttpCode(201)
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

  @Get()
  findAll() {
    return this.bicicletasService.findAll();
  }

  @Delete(':idBicicleta')
  async delete(@Param('idBicicleta') idBicicleta: number) {
    return this.bicicletasService.delete(idBicicleta);
  }
}
