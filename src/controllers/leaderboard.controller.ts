import { Response } from 'express'
import z from 'zod';
import { Errors } from '../constants/error';
import { schemaValidator } from '../utils/validator';
import { badRequest, notFound, ok, serverError } from '../utils/http-status';
import { UserRepository } from '../repositories/user.repository';
import { AuthenticateRequest } from '../types';
import { Jwt } from '../utils/jwt';

const scoreSchema = z.number({
  message: 'Score must be a number'
});

async function getLeaderboard(req: AuthenticateRequest, res: Response) {
  try {

    const usersResult = await UserRepository.findAll({
      sort: { score: -1 }
    });

    if(usersResult.isFailure()) {
      notFound(res, usersResult.error);
      return;
    }
    
    const leaderboard = usersResult.value?.slice(0, 10) ?? [];

    const leaderboardFormatted = leaderboard.map((rank, index) => {
      const {username,score} = rank;

      return {
        username,
        score,
        rank: index + 1
      }
    });

    const token = req.headers.authorization?.split(' ')[1];

    const decoded = Jwt.verify(token ?? '');

    const id = decoded.isSuccess() ? decoded.value.id ?? '' : '';

    const user = await UserRepository.findById(id);

    if(user.isFailure() || !user.value._id) {
      ok(res,{
        leaderboardFormatted
      });
      return;
    }

    const isUserInTop5 = leaderboard.find((u) => u._id.toString() === id);

    if(isUserInTop5) {
      ok(res, {
        leaderboardFormatted,
      });
      return;
    }

    const userScorePosition = usersResult.value.findIndex((u) => u._id.toString() === id) + 1;

    const {username,score} = user.value;

    ok(res, {
      leaderboardFormatted,
      user: {
        username,
        score,
        rank: userScorePosition
      }
    });
  } catch (error) {
    serverError(res);
  }
}



async function updateScore(req: AuthenticateRequest, res: Response) {
  try { 
    const { id } = req.params;

    if (!id) {
      badRequest(res, Errors.REQUIRED_ID)
      return;
    }

    const bodyResult = schemaValidator(scoreSchema, req.body.score);

    if(bodyResult.isFailure()) {
      badRequest(res, bodyResult.error);
      return;
    }
    const score = bodyResult.value;
    
    const updateResult = await UserRepository.update(id, {
      $inc: { score },
    }, { new: true });

    if(updateResult.isFailure()) {
      notFound(res, updateResult.error);
      return;
    }
    const newScore = updateResult.value;
    
    ok(res, {
      message: `Score updated successfully: new score is ${newScore}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: Errors.SERVER_ERROR
    })
  }
}

export { getLeaderboard, updateScore }
