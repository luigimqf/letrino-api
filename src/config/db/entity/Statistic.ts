import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { EStatistics } from '../../../constants/statistic'
import { User } from './User'
import { Word } from './Word'

@Entity('statistics')
export class Statistic {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Word, word => word.statistics)
  @JoinColumn({ name: 'wordId' })
  word: Word

  @Column()
  wordId: string

  @Column({ type: 'varchar', nullable: true })
  attempt?: string

  @ManyToOne(() => User, user => user.statistics)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column()
  userId: string

  @Column({
    type: 'enum',
    enum: EStatistics
  })
  type: EStatistics

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}