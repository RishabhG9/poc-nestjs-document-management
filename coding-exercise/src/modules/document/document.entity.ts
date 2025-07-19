import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', default: () => 'gen_random_uuid()' })
  uuid!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  archived!: Date | null;

  @Column()
  filename!: string;

  @Column()
  mimetype!: string;

  @Column()
  url!: string;

  @Column({ nullable: true, type: 'int' })
  uploadedBy!: number | null;
}