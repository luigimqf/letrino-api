import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UsedWord } from './UsedWord';
import { Attempt } from './Attempt';
import { Match } from './Match';
import { UTCCreateDateColumn, UTCUpdateDateColumn } from './date';

export interface IWord {
  id: string;
  word: string;
  isGolden: boolean;
  usedWords: UsedWord[];
  attempts: Attempt[];
  createdAt: Date;
  updatedAt: Date;
}
@Entity('words')
export class Word {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  word: string;

  @Column({ type: 'boolean', default: false })
  isGolden: boolean;

  @OneToMany(() => UsedWord, usedWord => usedWord.word)
  usedWords: UsedWord[];

  @OneToOne(() => Match, match => match.word)
  match: Match;

  @OneToMany(() => Attempt, attempt => attempt.word)
  attempts: Attempt[];

  @UTCCreateDateColumn()
  createdAt: Date;

  @UTCUpdateDateColumn()
  updatedAt: Date;
}
