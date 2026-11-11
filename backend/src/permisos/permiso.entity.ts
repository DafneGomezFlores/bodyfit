import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Membresia } from '../membresias/membresia.entity';

@Entity('permiso')
export class Permiso {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Membresia, (membresia) => membresia.permisos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'membresia_id' })
  membresia: Membresia;

  @Column({ name: 'dias_solicitados' })
  diasSolicitados: number;

  // 1. FECHA REGISTRO / SOLICITUD (Automática)
  @CreateDateColumn({ name: 'fecha_registro' })
  fechaRegistro: Date;

  // 2. FECHA DE INICIO DEL PERMISO (Congelamiento)
  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fechaInicio: string;

  // 3. FECHA DE FIN DEL PERMISO (Retorno)
  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin: string;

  // FECHAS DE CONTROL DE LA MEMBRESÍA
  @Column({ name: 'fecha_anterior', type: 'date' })
  fechaAnterior: string;

  @Column({ name: 'fecha_nueva', type: 'date' })
  fechaNueva: string;
}