import { DataSource } from 'typeorm';
import { env } from '../enviroment';
import { Attempt, Match, Token, UsedWord, User, Word } from './entity';

const isProduction = env.NODE_ENV === 'production';
const fileExtension = isProduction ? 'js' : 'ts';
const dir = isProduction ? 'dist' : 'src';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.DB_URL,
  synchronize: !isProduction,
  logging: !isProduction,
  entities: [`${dir}/config/db/entity/*.${fileExtension}`],
  migrations: [`${dir}/config/db/migrations/*.${fileExtension}`],
  subscribers: [`${dir}/config/db/subscribers/*.${fileExtension}`],
  ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  extra: {
    timezone: 'UTC',
  },
});
