import { env } from '../enviroment'
import { DataSource } from 'typeorm'
import { SkippedAttempt, Statistic, UsedWord, User, Word } from './entity'

const isSsl = env.DB_SSL === 'true';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: env.NODE_ENV === 'development',
  logging: env.NODE_ENV === 'development',
  entities: [User, Word, UsedWord, Statistic, SkippedAttempt],
  migrations: ['src/config/db/migrations/*.ts'],
  subscribers: ['src/config/db/subscribers/*.ts'],
  ssl: isSsl ? { rejectUnauthorized: false } : undefined,
})

async function setupDatabase() {
  try {
    await AppDataSource.initialize()
    console.log('Database connected successfully')
  } catch (error) {
    console.log('Error connecting to database:', error)
  }
}

export default setupDatabase
