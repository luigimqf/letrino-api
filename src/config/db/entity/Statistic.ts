import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm'
import { User } from './User'
import { Attempt } from './Attempt'

@Entity('statistics')
export class Statistic {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToOne(() => User, user => user.statistic)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column()
  userId: string

  @OneToMany(() => Attempt, attempt => attempt.statistic)
  attempts: Attempt[]

  @Column({ type: 'integer', default: 0 })
  gamesPlayed: number

  @Column({ type: 'integer', default: 0 })
  gamesWon: number

  @Column({ type: 'integer', default: 0 })
  gamesLost: number

  @Column({ type: 'integer', default: 0 })
  winStreak: number

  @Column({ type: 'integer', default: 0 })
  bestWinStreak: number

  @Column({ type: 'integer', default: 0 })
  score: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}