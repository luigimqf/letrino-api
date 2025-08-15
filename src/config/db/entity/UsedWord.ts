import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm'
import { Word } from './Word'

@Entity('used_words')
export class UsedWord {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Word, word => word.usedWords)
  @JoinColumn({ name: 'wordId' })
  word: Word

  @Column()
  wordId: string

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}