import { Request, Response } from 'express'
import { User } from '../config/db/models/users'

async function getLeaderboard(_: Request, res: Response) {
  try {
    const leaderboard = await User.find().sort({ score: -1 }).limit(5);

    if (!leaderboard) {
      res.status(404).json({
        success: false,
        error: 'Error fetching leaderboard'
      })
      return
    }
  
    res.status(200).json({
      success: true,
      data: leaderboard
    })
    return
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred'
    })
  }
}

export { getLeaderboard }
