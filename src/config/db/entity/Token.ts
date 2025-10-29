import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { ETokenStatus } from '../../../constants/token';

export interface IToken {
  id: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}

@Entity('tokens')
export class Token extends BaseEntity {
  @Column({ nullable: false, default: '' })
  token: string;

  @Column({ type: 'enum', enum: ETokenStatus, default: ETokenStatus.ACTIVE })
  status: ETokenStatus;
}
