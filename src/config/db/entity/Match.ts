import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from './User';
import { Attempt } from './Attempt';
import { EGameStatus } from '../../../constants/game';
import { Word } from './Word';
import { UTCCreateDateColumn, UTCUpdateDateColumn } from './date';

export interface IMatch {
  id: string;
  attempts: Attempt[];
  userId: string;
  score: number;
  result: EGameStatus;
  createdAt: Date;
  updatedAt: Date;
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Attempt, attempt => attempt.match, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  attempts: Attempt[];

  @ManyToOne(() => User, user => user.matches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => Word, word => word.match)
  @JoinColumn({ name: 'wordId' })
  word: Word;

  @Column()
  wordId: string;

  @Column()
  userId: string;

  @Column({ nullable: true, default: 0 })
  score: number;

  @Column({ type: 'enum', enum: EGameStatus })
  result: EGameStatus;

  @UTCCreateDateColumn()
  createdAt: Date;

  @UTCUpdateDateColumn()
  updatedAt: Date;
}
