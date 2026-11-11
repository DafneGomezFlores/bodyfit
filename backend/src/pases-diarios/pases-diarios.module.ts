import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaseDiario } from './pase-diario.entity';
import { PasesDiariosService } from './pases-diarios.service';
import { PasesDiariosController } from './pases-diarios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaseDiario])],
  controllers: [PasesDiariosController],
  providers: [PasesDiariosService],
  exports: [PasesDiariosService],
})
export class PasesDiariosModule {}
