import mongoose from 'mongoose'
import { env } from '../enviroment'

function setupDatabase() {
  try {
    mongoose.connect(env.MONGODB_URI ?? '')
    console.log('Connect to database')
  } catch (error) {
    console.log(error)
  }
}

export default setupDatabase
