import mongoose from "mongoose"
import 'dotenv/config'

function testDatabaseConnection() {
  try {
    mongoose.connect(process.env.MONGODB_URI ?? '')
    console.log('Connect to database')
  } catch (error) {
    console.log('Error connecting to database')
  } finally {
    mongoose.disconnect()
  }
}

testDatabaseConnection()