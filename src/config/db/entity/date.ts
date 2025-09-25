/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DateUtils } from '../../../utils/date';

export function UTCCreateDateColumn(options?: any) {
  return CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    transformer: {
      to: (value: Date) => (value ? DateUtils.toUTC(value) : value),
      from: (value: Date) => (value ? DateUtils.toUTC(value) : value),
    },
    ...options,
  });
}

export function UTCUpdateDateColumn(options?: any) {
  return UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    transformer: {
      to: (value: Date) => (value ? DateUtils.toUTC(value) : value),
      from: (value: Date) => (value ? DateUtils.toUTC(value) : value),
    },
    ...options,
  });
}
