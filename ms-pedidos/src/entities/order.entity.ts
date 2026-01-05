import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('orders', { schema: 'public' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'customer_id' })
  customerId: string;

  @Column('uuid', { name: 'stall_id' })
  stallId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column('varchar', { length: 50 })
  status: 'pendiente' | 'preparando' | 'listo' | 'entregado';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items: OrderItem[];
}