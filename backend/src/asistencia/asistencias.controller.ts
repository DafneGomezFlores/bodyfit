import { Controller, Get, Post, Body } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';

@Controller('asistencias')
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

  @Post('registrar')
  async registrar(@Body() body: any) {
    const ci = body.ci || body.carnet || body.documento || body.codigo;
    return await this.asistenciasService.registrarPorCi(ci);
  }

  @Get()
  async obtenerTodas() {
    return await this.asistenciasService.obtenerAsistenciasDeHoy();
  }
}