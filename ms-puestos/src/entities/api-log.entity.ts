import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('api_logs', { schema: 'public' })
export class ApiLog {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'route', length: 255 })
  route: string;

  @Column({ name: 'method', length: 20 })
  method: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;

  @Column({ name: 'status_code', type: 'int' })
  statusCode: number;

  @Column({ name: 'message', type: 'text', nullable: true })
  message: string;
}