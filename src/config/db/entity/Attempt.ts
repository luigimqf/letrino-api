import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Match } from './Match';
import { Word } from './Word';
import { EAttemptStatus } from '../../../constants/attempt';
import { BaseEntity } from './BaseEntity';

@Entity('attempts')
export class Attempt extends BaseEntity {
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
    enum: EAttemptStatus,
  })
  result: EAttemptStatus;
}
