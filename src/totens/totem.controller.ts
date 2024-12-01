import { Controller, Delete, Get, Post, Param, Body } from '@nestjs/common';
import { TotemService } from './totem.service';
import { CreateTotemDto } from './dto/create-totem.dto';

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
