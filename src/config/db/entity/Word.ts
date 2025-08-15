import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { UsedWord } from './UsedWord'
import { Statistic } from './Statistic'
import { SkippedAttempt } from './SkippedAttempt'

@Entity('words')
export class Word {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', unique: true })
  word: string

  @Column({ type: 'boolean', default: false })
  isGolden: boolean

  @OneToMany(() => UsedWord, usedWord => usedWord.word)
  usedWords: UsedWord[]

  @OneToMany(() => Statistic, statistic => statistic.word)
  statistics: Statistic[]

  @OneToMany(() => SkippedAttempt, skippedAttempt => skippedAttempt.word)
  skippedAttempts: SkippedAttempt[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}