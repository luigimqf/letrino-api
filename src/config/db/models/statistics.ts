import mongoose from 'mongoose'

const statisticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    unique: true
  },
  wordsPlayed: Number,
  wordsCorrect: Number,
  wordsIncorrect: Number,
  wordsSkipped: Number,
});

export const Statistics = mongoose.model('Statistics', statisticsSchema)

