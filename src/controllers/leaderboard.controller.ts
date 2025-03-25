import { Request, Response } from 'express'
import { User } from '../config/db/models/users'
import z from 'zod';
import { Errors } from '../constants/error';

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

const idSchema = z.string({
  message: 'Id is required'
});

const scoreSchema = z.number({
  message: 'Score must be a number'
});

async function updateScore(req: Request, res: Response) {
    try { 
      const { success, data: id, error } = idSchema.safeParse(req.params.id);
  
      if (!success) {
        res.status(400).json({
          success: false,
          error: error.issues[0].message
        })
        return
      }
  
      try {
        const { success: scoreSuccess, data: scoreData, error: scoreError } = scoreSchema.safeParse(req.body.score);

        if (!scoreSuccess) {
          res.status(400).json({
            success: false,
            error: scoreError.issues[0].message
          })
          return
        }

        const user = await User.findByIdAndUpdate(id, {
          $inc: { score: scoreData },
        }, { new: true });
  
        if (!user) {
          res.status(404).json({
            success: false,
            error: Errors.USER_NOT_FOUND
          })
          return
        }
    
        res.status(200).json({
          success: true,
          message: `Score updated successfully: new score is ${user.score}`
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          error
        })
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: Errors.SERVER_ERROR
      })
    }
}

export { getLeaderboard, updateScore }
