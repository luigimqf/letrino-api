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

export { getLeaderboard, updateScore }
