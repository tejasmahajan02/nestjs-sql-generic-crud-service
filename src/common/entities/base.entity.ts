import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

// This will be used with any table
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  modifiedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
