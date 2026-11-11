import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  findAll() {
    return this.usuarioRepo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return usuario;
  }

  findByCi(ci: string) {
    return this.usuarioRepo.findOne({ where: { ci }, relations: ['membresias'] });
  }

  create(dto: CreateUsuarioDto) {
    const usuario = this.usuarioRepo.create(dto);
    return this.usuarioRepo.save(usuario);
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);
    Object.assign(usuario, dto);
    return this.usuarioRepo.save(usuario);
  }

  async remove(id: number) {
    const usuario = await this.findOne(id);
    return this.usuarioRepo.remove(usuario);
  }
}
