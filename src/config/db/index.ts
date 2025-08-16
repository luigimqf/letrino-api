import { env } from '../enviroment'
import { DataSource } from 'typeorm'
import { SkippedAttempt, Statistic, UsedWord, User, Word } from './entity'

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.DB_URL,
  synchronize: env.NODE_ENV === 'development',
  logging: env.NODE_ENV === 'development',
  entities: [User, Word, UsedWord, Statistic, SkippedAttempt],
  migrations: ['src/config/db/migrations/*.ts'],
  subscribers: ['src/config/db/subscribers/*.ts'],
  ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
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
