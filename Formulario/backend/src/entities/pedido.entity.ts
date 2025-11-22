import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Vela } from './vela.entity';

@Entity()
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombreCompleto: string;

  @Column()
  telefono: string;

  @OneToMany(() => Vela, (vela) => vela.pedido, { cascade: true })
  velas: Vela[];
}
