import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm'
import { User } from './User'
import { Word } from './Word'

@Entity('skipped_attempts')
export class SkippedAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Word, word => word.skippedAttempts)
  @JoinColumn({ name: 'wordId' })
  word: Word

  @Column()
  wordId: string

  @ManyToOne(() => User, user => user.skippedAttempts)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column()
  userId: string

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}