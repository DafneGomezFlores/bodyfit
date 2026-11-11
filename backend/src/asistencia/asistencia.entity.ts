import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Membresia } from '../membresias/membresia.entity';

@Entity('asistencias')
export class Asistencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fechaHora: Date;

  @ManyToOne(() => Usuario, { eager: true })
  usuario: Usuario;

  @ManyToOne(() => Membresia, { eager: true, nullable: true })
  membresia: Membresia;

  @Column({ nullable: true })
  tipoAcceso: string;
}