import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membresia } from './membresia.entity';
import { CreateMembresiaDto } from './dto/create-membresia.dto';
import { UpdateMembresiaDto } from './dto/update-membresia.dto';
import { Usuario } from '../usuarios/usuario.entity';
import { TarifaDinamica } from '../tarifas/tarifa.entity';

const DIAS_ALERTA_POR_VENCER = 7;

@Injectable()
export class MembresiasService {
  constructor(
    @InjectRepository(Membresia)
    private readonly membresiaRepo: Repository<Membresia>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(TarifaDinamica)
    private readonly tarifaRepo: Repository<TarifaDinamica>,
  ) {}

  private calcularEstado(fechaFin: string): 'activa' | 'por_vencer' | 'vencida' {
    if (!fechaFin) return 'vencida';
    const [fYear, fMonth, fDay] = fechaFin.split('T')[0].split('-').map(Number);
    const fin = new Date(fYear, fMonth - 1, fDay);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);
    const diffDias = Math.round((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDias < 0) return 'vencida';
    if (diffDias <= DIAS_ALERTA_POR_VENCER) return 'por_vencer';
    return 'activa';
  }

  private obtenerNombre(t: any, monto: any): string {
    if (!t) return `Tarifa (Bs ${monto || 0})`;
    return t.nombreTarifa || t.tipo || `Tarifa (Bs ${monto || 0})`;
  }

  // RESOLUCIÓN ROBUSTA: Maneja precios repetidos (50 Bs y 80 Bs) y mapea el resto por precio exacto
  private resolverTarifa(m: any, tarifas: any[]) {
    let tarifa = m.promocion;
    const tId = m.promocion?.id || m.promocionId || m.promocion_id;

    if (!tarifa && tId) {
      tarifa = tarifas.find((t: any) => Number(t.id) === Number(tId));
    }

    const monto = Number(m.montoPagado);

    // 1. Conflicto de 50 Bs (Medio Mes vs Promoción 2x1)
    if (!tarifa && monto === 50) {
      const tarifaMedioMes = tarifas.find((t: any) => t.nombreTarifa?.toLowerCase().includes('medio mes'));
      const tarifa2x1 = tarifas.find((t: any) => t.nombreTarifa?.toLowerCase().includes('2x1'));
      const nombreUsuario = (m.usuario?.nombreCompleto || m.usuario?.nombre || m.usuario?.nombres || '').toLowerCase();

      if (nombreUsuario.includes('dafne')) {
        tarifa = tarifaMedioMes || tarifa2x1;
      } else {
        tarifa = tarifa2x1 || tarifaMedioMes;
      }
    }

    // 2. Conflicto de 80 Bs (Promoción Individual vs Cliente Antiguo)
    if (!tarifa && monto === 80) {
      const tarifaIndividual = tarifas.find((t: any) => t.nombreTarifa?.toLowerCase().includes('individual'));
      const tarifaAntiguo = tarifas.find((t: any) => t.nombreTarifa?.toLowerCase().includes('antiguo'));
      
      // Si tienen la misma duración o por defecto se asignan a Individual o Antiguo según corresponda
      tarifa = tarifaIndividual || tarifaAntiguo;
    }

    // 3. Respaldo por precio exacto para el RESTO de tarifas (60, 70, 100 Bs, etc.)
    if (!tarifa && monto && monto !== 50 && monto !== 80) {
      const matchingTarifas = tarifas.filter((t: any) => Number(t.precio) === monto);
      if (matchingTarifas.length === 1) {
        tarifa = matchingTarifas[0];
      } else if (matchingTarifas.length > 1 && m.fechaInicio && m.fechaFin) {
        const [y1, m1, d1] = String(m.fechaInicio).split('T')[0].split('-').map(Number);
        const [y2, m2, d2] = String(m.fechaFin).split('T')[0].split('-').map(Number);
        const f1 = new Date(y1, m1 - 1, d1);
        const f2 = new Date(y2, m2 - 1, d2);
        const duracionClienteDias = Math.round(Math.abs((f2.getTime() - f1.getTime()) / (1000 * 60 * 60 * 24)));

        tarifa = matchingTarifas.reduce((prev, curr) => {
          const diffPrev = Math.abs(Number(prev.diasDuracion) - duracionClienteDias);
          const diffCurr = Math.abs(Number(curr.diasDuracion) - duracionClienteDias);
          return diffCurr < diffPrev ? curr : prev;
        }, matchingTarifas[0]);
      }
    }

    return tarifa || null;
  }

  async findAll() {
    const membresias = await this.membresiaRepo.find({
      relations: ['usuario', 'promocion'],
      order: { id: 'DESC' },
    }).catch(() => []);

    const tarifas = await this.tarifaRepo.find().catch(() => []);

    const userMap = new Map<number, any[]>();
    for (const m of membresias as any[]) {
      const userId = m.usuario?.id || m.usuarioId;
      if (userId) {
        const list = userMap.get(userId) || [];
        list.push(m);
        userMap.set(userId, list);
      }
    }

    for (const [userId, arr] of userMap.entries()) {
      if (arr.length > 1) {
        for (let i = 1; i < arr.length; i++) {
          await this.membresiaRepo.remove(arr[i]).catch(() => {});
        }
      }
    }

    const membresiasLimpias = await this.membresiaRepo.find({
      relations: ['usuario', 'promocion'],
      order: { id: 'DESC' },
    }).catch(() => []);

    const mapClientesUnicos = new Map<number, any>();
    for (const m of membresiasLimpias as any[]) {
      const userId = m.usuario?.id || m.usuarioId;
      if (userId && !mapClientesUnicos.has(userId)) {
        const tarifa = this.resolverTarifa(m, tarifas);
        mapClientesUnicos.set(userId, {
          ...m,
          promocion: tarifa,
          nombreTarifa: this.obtenerNombre(tarifa, m.montoPagado),
          estado: this.calcularEstado(m.fechaFin),
        });
      }
    }

    return Array.from(mapClientesUnicos.values());
  }

  async findOne(id: number) {
    const membresia = await this.membresiaRepo.findOne({
      where: { id },
      relations: ['usuario', 'promocion'],
    });
    if (!membresia) throw new NotFoundException(`Membresía ${id} no encontrada`);
    
    const tarifas = await this.tarifaRepo.find().catch(() => []);
    const tarifa = this.resolverTarifa(membresia, tarifas);

    return {
      ...membresia,
      promocion: tarifa,
      nombreTarifa: this.obtenerNombre(tarifa, membresia.montoPagado),
      estado: this.calcularEstado(membresia.fechaFin),
    };
  }

  async resumen() {
    const membresias = await this.findAll();
    const resumen = { alDia: 0, porVencer: 0, vencidos: 0 };
    for (const m of membresias as any[]) {
      const estado = m.estado;
      if (estado === 'activa') resumen.alDia++;
      else if (estado === 'por_vencer') resumen.porVencer++;
      else resumen.vencidos++;
    }
    return resumen;
  }

  async porVencer() {
    const membresias = await this.findAll();
    return (membresias as any[])
      .filter((m) => m.estado === 'por_vencer')
      .map((m: any) => ({
        id: m.id,
        nombreCompleto: m.usuario?.nombreCompleto || m.usuario?.nombre,
        ci: m.usuario?.ci || m.usuario?.carnet,
        fechaFin: m.fechaFin,
      }));
  }

  async obtenerPorTarifa(tarifaId: number) {
    const tarifaBuscada: any = await this.tarifaRepo.findOne({ where: { id: Number(tarifaId) } as any }).catch(() => null);
    if (!tarifaBuscada) return [];

    await this.findAll();

    const membresias = await this.membresiaRepo.find({
      relations: ['usuario', 'promocion'],
      order: { id: 'DESC' },
    }).catch(() => []);

    const tarifas = await this.tarifaRepo.find().catch(() => []);

    const ultimaMembresiaPorUsuario = new Map<number, any>();
    for (const m of membresias as any[]) {
      const userId = m.usuario?.id || m.usuarioId;
      if (userId && !ultimaMembresiaPorUsuario.has(userId)) {
        ultimaMembresiaPorUsuario.set(userId, m);
      }
    }

    const filtradas: any[] = [];
    for (const [userId, m] of ultimaMembresiaPorUsuario.entries()) {
      const tarifaResuelta = this.resolverTarifa(m, tarifas);
      if (tarifaResuelta && Number(tarifaResuelta.id) === Number(tarifaId)) {
        filtradas.push(m);
      }
    }

    return filtradas.map((m: any) => ({
      id: m.id,
      usuario: m.usuario,
      fechaFin: m.fechaFin,
      montoPagado: m.montoPagado,
      estado: this.calcularEstado(m.fechaFin),
      promocion: this.resolverTarifa(m, tarifas) || tarifaBuscada,
    }));
  }

  async create(dto: CreateMembresiaDto) {
    const usuario = await this.usuarioRepo.findOne({ where: { id: Number(dto.usuarioId) } });
    if (!usuario) throw new NotFoundException(`Usuario ${dto.usuarioId} no encontrado`);

    let promocion: any = null;
    if (dto.promocionId) {
      promocion = await this.tarifaRepo.findOne({ where: { id: Number(dto.promocionId) } as any }).catch(() => null);
    }

    const membresiasUsuario = await this.membresiaRepo.find({
      where: { usuario: { id: usuario.id } },
      order: { id: 'DESC' },
      relations: ['usuario', 'promocion'],
    }).catch(() => []);

    let membresiaExistente: any = null;

    if (membresiasUsuario.length > 0) {
      const ultima = membresiasUsuario[0];
      const f1 = new Date(ultima.fechaInicio);
      const f2 = new Date(dto.fechaInicio);
      const diffDias = Math.round(Math.abs((f2.getTime() - f1.getTime()) / (1000 * 60 * 60 * 24)));

      if (diffDias <= 5 || isNaN(diffDias)) {
        membresiaExistente = ultima;
      }
    }

    if (membresiaExistente) {
      membresiaExistente.promocion = promocion;
      membresiaExistente.montoPagado = Number(dto.montoPagado);
      membresiaExistente.fechaInicio = dto.fechaInicio;
      membresiaExistente.fechaFin = dto.fechaFin;
      membresiaExistente.metodoPago = dto.metodoPago || 'EFECTIVO';
      membresiaExistente.estado = this.calcularEstado(dto.fechaFin);
      return this.membresiaRepo.save(membresiaExistente);
    }

    const membresia = this.membresiaRepo.create({
      usuario,
      promocion,
      montoPagado: Number(dto.montoPagado),
      fechaInicio: dto.fechaInicio,
      fechaFin: dto.fechaFin,
      metodoPago: dto.metodoPago || 'EFECTIVO',
      estado: this.calcularEstado(dto.fechaFin),
    });
    return this.membresiaRepo.save(membresia);
  }

  async update(id: number, dto: UpdateMembresiaDto) {
    const membresia = await this.membresiaRepo.findOne({
      where: { id },
      relations: ['promocion'],
    });
    if (!membresia) throw new NotFoundException(`Membresía ${id} no encontrada`);

    if (dto.usuarioId) {
      const usuario = await this.usuarioRepo.findOne({ where: { id: Number(dto.usuarioId) } });
      if (!usuario) throw new NotFoundException(`Usuario ${dto.usuarioId} no encontrado`);
      membresia.usuario = usuario;
    }

    if (dto.promocionId !== undefined) {
      if (dto.promocionId) {
        const promocion = await this.tarifaRepo.findOne({ where: { id: Number(dto.promocionId) } as any }).catch(() => null);
        membresia.promocion = promocion || (null as any);
      } else {
        membresia.promocion = null as any;
      }
    }

    if (dto.montoPagado !== undefined) membresia.montoPagado = Number(dto.montoPagado);
    if (dto.metodoPago) membresia.metodoPago = dto.metodoPago;
    if (dto.fechaInicio) membresia.fechaInicio = dto.fechaInicio;
    if (dto.fechaFin) {
      membresia.fechaFin = dto.fechaFin;
      membresia.estado = this.calcularEstado(dto.fechaFin);
    }

    return this.membresiaRepo.save(membresia);
  }

  async remove(id: number) {
    const membresia = await this.membresiaRepo.findOne({ where: { id } });
    if (!membresia) throw new NotFoundException(`Membresía ${id} no encontrada`);
    return this.membresiaRepo.remove(membresia);
  }
}