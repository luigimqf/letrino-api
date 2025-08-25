import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EStatistics } from '../../../constants/statistic';
import { User } from './User';
import { Word } from './Word';
import { Statistic } from './Statistic';

@Entity('attempts')
export class Attempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.attempts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Statistic, statistic => statistic.attempts)
  @JoinColumn({ name: 'statisticId' })
  statistic: Statistic;

  @Column()
  statisticId: string;

  @ManyToOne(() => Word, word => word.attempts)
  @JoinColumn({ name: 'wordId' })
  word: Word;

  @Column()
  wordId: string;

  @Column({ type: 'varchar', length: 255 })
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
