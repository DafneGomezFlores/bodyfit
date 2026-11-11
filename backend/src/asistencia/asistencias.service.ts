import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asistencia } from './asistencia.entity';
import { Membresia } from '../membresias/membresia.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Permiso } from '../permisos/permiso.entity';

@Injectable()
export class AsistenciasService {
  constructor(
    @InjectRepository(Asistencia)
    private readonly asistenciaRepository: Repository<Asistencia>,
    @InjectRepository(Membresia)
    private readonly membresiaRepository: Repository<Membresia>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Permiso)
    private readonly permisoRepository: Repository<Permiso>,
  ) {}

  // Función auxiliar para parsear fechas locales sin desfase de zona horaria (UTC)
  private parseLocalDate(dateInput: any): Date {
    if (!dateInput) return new Date(0);
    const str = String(dateInput).split('T')[0];
    const parts = str.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return new Date(dateInput);
  }

  async registrarPorCi(ci: string): Promise<Asistencia> {
    const ciLimpio = String(ci).trim();

    // 1. Buscar al usuario por CI
    const usuario = await this.usuarioRepository.findOne({
      where: { ci: ciLimpio },
    });

    if (!usuario) {
      throw new NotFoundException('Cliente no encontrado con ese número de carnet.');
    }

    // 2. Buscar todas las membresías del usuario
    const membresias = await this.membresiaRepository.find({
      where: { usuario: { id: usuario.id } },
      relations: ['usuario'],
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 3. Validar de forma automática y estricta usando fechas locales reales
    const membresiaActiva = membresias.find((m: any) => {
      if (!m.fechaFin) return false;
      const dFin = this.parseLocalDate(m.fechaFin);
      dFin.setHours(23, 59, 59, 999);
      return dFin >= hoy; // Debe ser hoy o una fecha futura
    }) || null;

    // 4. Buscar permisos activos por rango de fechas locales
    let permisoActivo: Permiso | null = null;
    try {
      const permisos = await this.permisoRepository.find({
        relations: ['membresia', 'membresia.usuario'],
      });

      permisoActivo = permisos.find((p: any) => {
        const userId = p.membresia?.usuario?.id;
        if (userId !== usuario.id) return false;
        if (!p.fechaInicio || !p.fechaFin) return false;

        const dInicio = this.parseLocalDate(p.fechaInicio);
        dInicio.setHours(0, 0, 0, 0);

        const dFin = this.parseLocalDate(p.fechaFin);
        dFin.setHours(23, 59, 59, 999);

        return hoy >= dInicio && hoy <= dFin;
      }) || null;
    } catch (e) {
      permisoActivo = null;
    }

    // 5. Validar acceso: si no tiene membresía vigente ni permiso, se bloquea
    if (!membresiaActiva && !permisoActivo) {
      const tieneHistorial = membresias.length > 0;
      if (tieneHistorial) {
        throw new NotFoundException('La membresía del cliente se encuentra VENCIDA.');
      } else {
        throw new NotFoundException('El cliente no cuenta con una membresía activa ni permisos vigentes.');
      }
    }

    // 6. Registrar la asistencia
    const nuevaAsistencia = this.asistenciaRepository.create({
      usuario: usuario,
      membresia: membresiaActiva || (permisoActivo as any)?.membresia || null,
      tipoAcceso: permisoActivo && !membresiaActiva ? 'permiso' : 'membresia',
    } as any);

    const guardada = await this.asistenciaRepository.save(nuevaAsistencia as any);

    return await this.asistenciaRepository.findOne({
      where: { id: (guardada as any).id },
      relations: ['usuario', 'membresia'],
    }) as Asistencia;
  }

  async obtenerAsistenciasDeHoy(): Promise<Asistencia[]> {
    const asistencias = await this.asistenciaRepository.find({
      relations: ['usuario', 'membresia'],
      order: { fechaHora: 'DESC' },
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Calcular en tiempo real y automáticamente el estado exacto para la tabla
    return asistencias.map((a: any) => {
      if (a.membresia && a.membresia.fechaFin) {
        const dFin = this.parseLocalDate(a.membresia.fechaFin);
        dFin.setHours(23, 59, 59, 999);

        if (dFin < hoy) {
          a.membresia.estado = 'vencida';
        } else {
          const diffTime = dFin.getTime() - hoy.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays <= 3) {
            a.membresia.estado = 'por_vencer';
          } else {
            a.membresia.estado = 'activa';
          }
        }
      }
      return a;
    });
  }
}