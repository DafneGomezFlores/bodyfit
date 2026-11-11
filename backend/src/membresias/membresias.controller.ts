import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { MembresiasService } from './membresias.service';
import { CreateMembresiaDto } from './dto/create-membresia.dto';
import { UpdateMembresiaDto } from './dto/update-membresia.dto';

@Controller('membresias')
export class MembresiasController {
  constructor(private readonly membresiasService: MembresiasService) {}

  @Get()
  findAll() {
    return this.membresiasService.findAll();
  }

  @Get('resumen')
  resumen() {
    return this.membresiasService.resumen();
  }

  @Get('por-vencer')
  porVencer() {
    return this.membresiasService.porVencer();
  }

  @Get('por-tarifa/:tarifaId')
  obtenerPorTarifa(@Param('tarifaId', ParseIntPipe) tarifaId: number) {
    return this.membresiasService.obtenerPorTarifa(tarifaId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.membresiasService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateMembresiaDto) {
    return this.membresiasService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMembresiaDto) {
    return this.membresiasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.membresiasService.remove(id);
  }
}
