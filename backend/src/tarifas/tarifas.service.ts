import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarifaDinamica } from './tarifa.entity';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';

@Injectable()
export class TarifasService {
  constructor(
    @InjectRepository(TarifaDinamica)
    private readonly tarifaRepo: Repository<TarifaDinamica>,
  ) {}

  findAll() {
    return this.tarifaRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const tarifa = await this.tarifaRepo.findOne({ where: { id } });
    if (!tarifa) throw new NotFoundException(`Tarifa ${id} no encontrada`);
    return tarifa;
  }

  create(dto: CreateTarifaDto) {
    const tarifa = this.tarifaRepo.create(dto);
    return this.tarifaRepo.save(tarifa);
  }

  async update(id: number, dto: UpdateTarifaDto) {
    const tarifa = await this.findOne(id);
    Object.assign(tarifa, dto);
    return this.tarifaRepo.save(tarifa);
  }

  async remove(id: number) {
    const tarifa = await this.findOne(id);
    return this.tarifaRepo.remove(tarifa);
  }
}
