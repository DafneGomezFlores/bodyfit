import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membresia } from './membresia.entity';
import { MembresiasService } from './membresias.service';
import { MembresiasController } from './membresias.controller';
import { Usuario } from '../usuarios/usuario.entity';
import { TarifaDinamica } from '../tarifas/tarifa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Membresia, Usuario, TarifaDinamica])],
  controllers: [MembresiasController],
  providers: [MembresiasService],
  exports: [MembresiasService],
})
export class MembresiasModule {}
