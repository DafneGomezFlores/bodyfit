import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pase_diarios')
export class PaseDiario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre_visita', length: 150 })
  nombreVisita: string;

  @Column('decimal', { precision: 10, scale: 2 })
  monto: number;

  // NUEVO: Método de pago (EFECTIVO o QR)
  @Column({ name: 'metodo_pago', type: 'varchar', default: 'EFECTIVO', nullable: true })
  metodoPago: string;

  @CreateDateColumn({ name: 'fecha_registro' })
  fechaRegistro: Date;
}