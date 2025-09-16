import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

export interface ISkippedAttempt {
  id: string;
  wordId: string;
  userId: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Entity('skipped_attempts')
export class SkippedAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  wordId: string;

  @Column()
  userId: string;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
