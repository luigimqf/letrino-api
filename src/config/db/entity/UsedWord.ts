import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Word } from './Word';
import { User } from './User';

export interface IUsedWord {
  id: string;
  wordId: string;
  userId: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Entity('used_words')
export class UsedWord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.usedWords)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Word, word => word.usedWords, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'wordId' })
  word: Word;

  @Column()
  wordId: string;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
