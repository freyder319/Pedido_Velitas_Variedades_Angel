import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pedido } from './pedido.entity';

@Entity()
export class Vela {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  texto: string;

  @Column({ default: false })
  confirmado: boolean;

  @ManyToOne(() => Pedido, (pedido) => pedido.velas, { onDelete: 'CASCADE' })
  pedido: Pedido;
}
