import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asistencia } from './asistencia.entity';
import { AsistenciasController } from './asistencias.controller';
import { AsistenciasService } from './asistencias.service';
import { Membresia } from '../membresias/membresia.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Permiso } from '../permisos/permiso.entity'; // 👈 1. Importa la entidad Permiso

@Module({
  imports: [
    TypeOrmModule.forFeature([Asistencia, Membresia, Usuario, Permiso]), // 👈 2. Agrégala aquí
  ],
  controllers: [AsistenciasController],
  providers: [AsistenciasService],
  exports: [AsistenciasService],
})
export class AsistenciasModule {}