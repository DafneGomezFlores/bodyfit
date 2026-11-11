import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Membresia } from '../membresias/membresia.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  ci: string;

  @Column({ name: 'nombre_completo', length: 150 })
  nombreCompleto: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @OneToMany(() => Membresia, (membresia) => membresia.usuario)
  membresias: Membresia[];
}
