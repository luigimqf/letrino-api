import { DataSource } from 'typeorm';
import { env } from '../enviroment';
import { Attempt, Match, Token, UsedWord, User, Word } from './entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.DB_URL,
  synchronize: env.NODE_ENV === 'development',
  // synchronize: false,
  logging: env.NODE_ENV !== 'production',
  // logging: false,
  entities: [User, Word, UsedWord, Match, Attempt, Token],
  migrations: ['src/config/db/migrations/*.ts'],
  subscribers: ['src/config/db/subscribers/*.ts'],
  ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  extra: {
    timezone: 'UTC',
  },
});
