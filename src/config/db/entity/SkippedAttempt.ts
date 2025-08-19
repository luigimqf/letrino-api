import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm'
import { User } from './User'
import { Word } from './Word'

@Entity('skipped_attempts')
export class SkippedAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  wordId: string

  @Column()
  userId: string

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}