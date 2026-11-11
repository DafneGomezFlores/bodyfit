import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permiso } from './permiso.entity';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { Membresia } from '../membresias/membresia.entity';

@Injectable()
export class PermisosService {
  constructor(
    @InjectRepository(Permiso)
    private readonly permisoRepo: Repository<Permiso>,
    @InjectRepository(Membresia)
    private readonly membresiaRepo: Repository<Membresia>,
  ) {}

  findAll() {
    return this.permisoRepo.find({
      relations: ['membresia', 'membresia.usuario'],
      order: { fechaRegistro: 'DESC' },
    });
  }

  async findOne(id: number) {
    const permiso = await this.permisoRepo.findOne({
      where: { id },
      relations: ['membresia', 'membresia.usuario'],
    });
    if (!permiso) throw new NotFoundException(`Permiso ${id} no encontrado`);
    return permiso;
  }

  async create(dto: CreatePermisoDto) {
    const membresia = await this.membresiaRepo.findOne({ where: { id: dto.membresiaId } });
    if (!membresia) throw new NotFoundException(`Membresía ${dto.membresiaId} no encontrada`);

    // Aplica automáticamente la nueva fecha de fin a la membresía
    membresia.fechaFin = dto.fechaNueva;
    await this.membresiaRepo.save(membresia);

    const permiso = this.permisoRepo.create({
      membresia,
      diasSolicitados: dto.diasSolicitados,
      fechaAnterior: dto.fechaAnterior,
      fechaNueva: dto.fechaNueva,
    });
    return this.permisoRepo.save(permiso);
  }

  async remove(id: number) {
    const permiso = await this.findOne(id);
    return this.permisoRepo.remove(permiso);
  }
}
