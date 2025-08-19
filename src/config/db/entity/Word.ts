import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { UsedWord } from './UsedWord'
import { Attempt } from './Attempt'

@Entity('words')
export class Word {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255, unique: true })
  word: string

  @Column({ type: 'boolean', default: false })
  isGolden: boolean

  @OneToMany(() => UsedWord, usedWord => usedWord.word)
  usedWords: UsedWord[]

  @OneToMany(() => Attempt, attempt => attempt.word)
  attempts: Attempt[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}