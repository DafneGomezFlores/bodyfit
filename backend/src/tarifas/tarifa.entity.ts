import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tarifa_dinamica')
export class TarifaDinamica {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre_tarifa', length: 100 })
  nombreTarifa: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column({ name: 'dias_duracion' })
  diasDuracion: number;

  @Column({ length: 50 })
  tipo: string;
}
