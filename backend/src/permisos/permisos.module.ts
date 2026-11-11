import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from './permiso.entity';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { Membresia } from '../membresias/membresia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permiso, Membresia])],
  controllers: [PermisosController],
  providers: [PermisosService],
  exports: [PermisosService],
})
export class PermisosModule {}
