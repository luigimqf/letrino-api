import mongoose from 'mongoose'

function setupDatabase() {
  mongoose.connect(process.env.MONGODB_URI ?? '')
}

export default setupDatabase
