import { Response } from 'express'
import z from 'zod';
import { Errors } from '../constants/error';
import { notFound, ok, serverError } from '../utils/http-status';
import { UserRepository } from '../repositories/user.repository';
import { AuthenticateRequest } from '../types';
import { Jwt } from '../utils/jwt';
import { Validate } from '../utils/validator';

const scoreSchema = z.object({
  score: z.number({
    message: 'Score must be a number'
  })
});

const idParamsSchema = z.object({
  id: z.string().nonempty('ID is required')
});

class LeaderboardController {
  async getLeaderboard(req: AuthenticateRequest, res: Response) {
    try {
      const usersResult = await UserRepository.findAll({
        sort: { score: 'DESC' }
      });

      if(usersResult.isFailure()) {
        notFound(res, usersResult.error);
        return;
      }
      
      const leaderboard = usersResult.value?.slice(0, 10) ?? [];

      const leaderboardFormatted = leaderboard.map((rank, index) => {
        const {username,score,avatar} = rank;

        return {
          avatar,
          username,
          score,
          position: index + 1
        }
      });

      const token = req.headers.authorization?.split(' ')[1];

      const decoded = Jwt.verify(token ?? '');

      const id = decoded.isSuccess() ? decoded.value.id ?? '' : '';

      const user = await UserRepository.findById(id);

      if(user.isFailure() || !user.value.id) {
        ok(res,{
          leaderboard: leaderboardFormatted
        });
        return;
      }

      const isUserInTop5 = leaderboard.find((u) => u.id.toString() === id);

      if(isUserInTop5) {
        ok(res, {
          leaderboard: leaderboardFormatted,
        });
        return;
      }

      const userScorePosition = usersResult.value.findIndex((u) => u.id.toString() === id) + 1;

      const {username,score,avatar} = user.value;

      ok(res, {
        leaderboard: leaderboardFormatted,
        user: {
          avatar,
          username,
          score,
          position: userScorePosition
        }
      });
    } catch (error) {
      serverError(res);
    }
  }

  @Validate({
    body: scoreSchema,
    params: idParamsSchema,
  })
  async updateScore(req: AuthenticateRequest, res: Response) {
    try { 
      const { id } = req.params;
      const { score } = req.body;
      
      const updateResult = await UserRepository.updateScore(id, score);

      if(updateResult.isFailure()) {
        notFound(res, updateResult.error);
        return;
      }
      
      const updatedUser = updateResult.value;
      
      ok(res, {
        message: `Score updated successfully: new score is ${updatedUser?.score}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: Errors.SERVER_ERROR
      })
    }
  }
}

const leaderboardController = new LeaderboardController();

export const getLeaderboard = leaderboardController.getLeaderboard.bind(leaderboardController);
export const updateScore = leaderboardController.updateScore.bind(leaderboardController);
