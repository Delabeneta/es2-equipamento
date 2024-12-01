import { Controller, Delete, Get, Post, Param, Body } from '@nestjs/common';
import { CreateTotemDto } from './dto/create-Totem.dto';
import { TotemService } from './totem.service';

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
}
