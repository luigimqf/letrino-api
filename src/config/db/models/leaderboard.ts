import mongoose from 'mongoose'

const leaderboardSchema = new mongoose.Schema({
  name: String,
  score: Number
})

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema)

export { Leaderboard }
