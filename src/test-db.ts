import 'reflect-metadata'
import 'dotenv/config'
import { AppDataSource } from './config/db/data-source'

async function testDatabaseConnection() {
  try {
    await AppDataSource.initialize()
    console.log('Connected to PostgreSQL database')
  } catch (error) {
    console.log('Error connecting to database:', error)
  } finally {
    await AppDataSource.destroy()
  }
}

testDatabaseConnection()