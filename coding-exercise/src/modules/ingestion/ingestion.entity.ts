import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { Document } from '../document/document.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum IngestionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('ingestions')
export class Ingestion {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', default: () => 'gen_random_uuid()' })
  uuid!: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  archived!: Date | null;

  @ApiProperty({ enum: IngestionStatus })
  @Column({
    type: 'enum',
    enum: IngestionStatus,
    default: IngestionStatus.PENDING,
  })
  status!: IngestionStatus;

  @ApiProperty()
  @Column({ nullable: true })
  progress!: number; // 0-100

  @ApiProperty()
  @Column({ nullable: true })
  errorMessage!: string;

  @ApiProperty()
  @Column({ nullable: true })
  embeddingsGenerated!: number;

  @ApiProperty({ type: () => Document })
  @ManyToOne(() => Document, { eager: true })
  @JoinColumn({ name: 'documentId' })
  document!: Document;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'triggeredBy' })
  triggeredBy!: User;
}