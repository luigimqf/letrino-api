import { AppDataSource } from './data-source'

async function setupDatabase() {
  try {
    await AppDataSource.initialize()
    console.log('Database connected successfully')
  } catch (error) {
    console.log('Error connecting to database:', error)
  }
}

export default setupDatabase
