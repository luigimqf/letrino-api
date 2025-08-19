import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm'
import { Statistic } from './Statistic'
import { Attempt } from './Attempt'

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
  passwordHash: string

  @OneToOne(() => Statistic, statistic => statistic.user)
  statistic: Statistic

  @OneToMany(() => Attempt, attempt => attempt.user)
  attempts: Attempt[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}