import { DataSource } from 'typeorm';
import { env } from '../enviroment';
import { Attempt, Match, UsedWord, User, Word } from './entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.DB_URL,
  synchronize: env.NODE_ENV === 'development',
  logging: env.NODE_ENV === 'development',
  entities: [User, Word, UsedWord, Match, Attempt],
  migrations: ['src/config/db/migrations/*.ts'],
  subscribers: ['src/config/db/subscribers/*.ts'],
  ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  extra: {
    timezone: 'UTC',
  },
});
