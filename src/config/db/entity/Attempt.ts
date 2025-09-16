import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Match } from './Match';
import { Word } from './Word';
import { EStatistics } from '../../../constants/statistic';

export interface IAttempt {
  id: string;
  userId: string;
  gamePlayedId: string;
  wordId: string;
  userInput: string;
  result: EStatistics;
  createdAt: Date;
  updatedAt: Date;
}

@Entity('attempts')
export class Attempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.attempts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Match, match => match.attempts)
  @JoinColumn({ name: 'matchId' })
  match: Match;

  @Column()
  matchId: string;

  @ManyToOne(() => Word, word => word.attempts)
  @JoinColumn({ name: 'wordId' })
  word: Word;

  @Column()
  wordId: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  userInput: string;

  @Column({
    type: 'enum',
    enum: EStatistics,
  })
  result: EStatistics;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
