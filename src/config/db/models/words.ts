import mongoose from 'mongoose'

const wordSchema = new mongoose.Schema({
  word: String
})

const Words = mongoose.model('Words', wordSchema)

export { Words }
