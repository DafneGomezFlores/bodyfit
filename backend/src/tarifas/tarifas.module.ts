import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarifaDinamica } from './tarifa.entity';
import { TarifasService } from './tarifas.service';
import { TarifasController } from './tarifas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TarifaDinamica])],
  controllers: [TarifasController],
  providers: [TarifasService],
  exports: [TarifasService],
})
export class TarifasModule {}
