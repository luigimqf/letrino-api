import mongoose from 'mongoose'

const wordSchema = new mongoose.Schema({
  word: String
})

export const Words = mongoose.model('Words', wordSchema)

