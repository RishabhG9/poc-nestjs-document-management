import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('documents')
export class Document {
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

  @ApiProperty()
  @Column()
  filename!: string;

  @ApiProperty()
  @Column()
  mimetype!: string;

  @ApiProperty()
  @Column()
  url!: string;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'uploadedBy' })
  uploadedBy!: User;
}