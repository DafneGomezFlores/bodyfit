import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsuariosModule } from './usuarios/usuarios.module';
import { TarifasModule } from './tarifas/tarifas.module';
import { MembresiasModule } from './membresias/membresias.module';
import { PermisosModule } from './permisos/permisos.module';
import { PasesDiariosModule } from './pases-diarios/pases-diarios.module';
import { AsistenciasModule } from './asistencia/asistencias.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'gymbodyfit.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsuariosModule,
    TarifasModule,
    MembresiasModule,
    PermisosModule,
    PasesDiariosModule,
    AsistenciasModule,
  ],
})
export class AppModule {}
