import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { PasesDiariosService } from './pases-diarios.service';
import { CreatePaseDiarioDto } from './dto/create-pase-diario.dto';

@Controller('pases-diarios')
export class PasesDiariosController {
  constructor(private readonly pasesDiariosService: PasesDiariosService) {}

  @Get()
  findAll() {
    return this.pasesDiariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pasesDiariosService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePaseDiarioDto) {
    return this.pasesDiariosService.create(dto);
  }

  // AÑADIR ESTA RUTA PATCH PARA LA ACTUALIZACIÓN:
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreatePaseDiarioDto>,
  ) {
    return this.pasesDiariosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pasesDiariosService.remove(id);
  }
}
