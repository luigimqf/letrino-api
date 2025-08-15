import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { Statistic } from './Statistic'
import { SkippedAttempt } from './SkippedAttempt'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255, unique: true })
  username: string

  @Column({ 
    type: 'varchar', 
    default: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade'
  })
  avatar: string

  @Column({ type: 'varchar', unique: true })
  email: string

  @Column({ type: 'varchar' })
  password: string

  @Column({ type: 'integer', default: 0 })
  score: number

  @OneToMany(() => Statistic, statistic => statistic.user)
  statistics: Statistic[]

  @OneToMany(() => SkippedAttempt, skippedAttempt => skippedAttempt.user)
  skippedAttempts: SkippedAttempt[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}