import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items', { schema: 'public' })
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'order_id' })
  orderId: string;

  @Column('uuid', { name: 'product_id' })
  productId: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { name: 'unit_price', precision: 10, scale: 2 })
  unitPrice: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}