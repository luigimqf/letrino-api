import mongoose from 'mongoose'
import { env } from '../enviroment'

function setupDatabase() {
  mongoose.connect(env.MONGODB_URI ?? '')
}

export default setupDatabase
