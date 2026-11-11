import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { TarifaDinamica } from '../tarifas/tarifa.entity';
import { Permiso } from '../permisos/permiso.entity';

@Entity('membresia')
export class Membresia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fechaInicio: string;

  @Column()
  fechaFin: string;

  @Column('decimal', { precision: 10, scale: 2 })
  montoPagado: number;

  @Column({ type: 'varchar', default: 'EFECTIVO', nullable: true })
  metodoPago: string;

  @Column({ default: 'activa' })
  estado: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.membresias, { onDelete: 'CASCADE' })
  usuario: Usuario;

  @ManyToOne(() => TarifaDinamica, { nullable: true, onDelete: 'SET NULL' })
  promocion: TarifaDinamica;

  @OneToMany(() => Permiso, (permiso) => permiso.membresia)
  permisos: Permiso[];
}