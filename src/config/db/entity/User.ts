import { Entity, Column, OneToMany } from 'typeorm';
import { Attempt } from './Attempt';
import { UsedWord } from './UsedWord';
import { Match } from './Match';
import { BaseEntity } from './BaseEntity';

export interface IUser {
  id: string;
  username: string;
  avatar: string;
  email: string;
  passwordHash: string;
  attempts: Attempt[];
  usedWords: UsedWord[];
  matches: Match[];
  gamePlayedId: string;
  createdAt: Date;
  updatedAt: Date;
}
@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  username: string;

  @Column({
    type: 'varchar',
    default: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade',
  })
  avatar: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  passwordHash: string;

  @Column({ nullable: true })
  externalId: string;

  @OneToMany(() => Attempt, attempt => attempt.user)
  attempts: Attempt[];

  @OneToMany(() => UsedWord, usedWord => usedWord.user)
  usedWords: UsedWord[];

  @OneToMany(() => Match, match => match.user)
  matches: Match[];
}
