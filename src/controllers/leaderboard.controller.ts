import { Request, Response } from 'express'
import z from 'zod';
import { Errors } from '../constants/error';
import { schemaValidator } from '../utils/validator';
import { badRequest, notFound, ok, serverError } from '../utils/http-status';
import { UserRepository } from '../repositories/user.repository';

const idSchema = z.string({
  message: 'Id is required'
});

const scoreSchema = z.number({
  message: 'Score must be a number'
});

async function getLeaderboard(req: Request, res: Response) {
  try {
    const usersResult = await UserRepository.findAll({
      sort: { score: -1 }
    });

    if(usersResult.isFailure()) {
      notFound(res, usersResult.error);
      return;
    }

    const idResult = schemaValidator(idSchema, req.params.id);

    if(idResult.isFailure()) {
      badRequest(res, idResult.error);
      return;
    }

    const user = await UserRepository.find(idResult.value);

    if(user.isFailure()) {
      notFound(res, user.error);
      return;
    }
    
    const leaderboard = usersResult.value.slice(0, 5);
    const isUserInTop5 = leaderboard.find((u) => u._id.toString() === idResult.value);

    if(isUserInTop5) {
      ok(res, {
        leaderboard,
      });
      return;
    }

    const userScorePosition = usersResult.value.findIndex((u) => u._id.toString() === idResult.value) + 1;

    ok(res, {
      leaderboard,
      user: {
        ...user.value,
        rank: userScorePosition
      }
    });
  } catch (error) {
    serverError(res);
  }
}



async function updateScore(req: Request, res: Response) {
  try { 
    const { id } = req.params;
    const idResult = schemaValidator(idSchema, id);

    if (idResult.isFailure()) {
      badRequest(res, idResult.error)
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
