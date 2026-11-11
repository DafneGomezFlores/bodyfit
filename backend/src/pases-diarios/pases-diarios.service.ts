import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaseDiario } from './pase-diario.entity';
import { CreatePaseDiarioDto } from './dto/create-pase-diario.dto';

@Injectable()
export class PasesDiariosService {
  constructor(
    @InjectRepository(PaseDiario)
    private readonly paseRepo: Repository<PaseDiario>,
  ) {}

  findAll() {
    return this.paseRepo.find({ order: { fechaRegistro: 'DESC' } });
  }

  async findOne(id: number) {
    const pase = await this.paseRepo.findOne({ where: { id } });
    if (!pase) throw new NotFoundException(`Pase diario ${id} no encontrado`);
    return pase;
  }

  create(dto: CreatePaseDiarioDto) {
    const pase = this.paseRepo.create(dto);
    return this.paseRepo.save(pase);
  }

  // MÉTODO AGREGADO PARA ACTUALIZAR REGISTROS
  async update(id: number, dto: Partial<CreatePaseDiarioDto>) {
    const pase = await this.findOne(id);
    this.paseRepo.merge(pase, dto);
    return this.paseRepo.save(pase);
  }

  async remove(id: number) {
    const pase = await this.findOne(id);
    return this.paseRepo.remove(pase);
  }
}
