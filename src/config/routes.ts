import {
  signIn,
  forgotPassword,
  refreshToken,
  refreshPassword,
  signUp,
} from '../controllers/auth.controller';
import { getLeaderboard } from '../controllers/leaderboard.controller';
import { Express } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { sentryUserContext } from '../middlewares/sentry';
import {
  attemptFail,
  registerSkippedAttemp,
  deleteSkippedAttempDocument,
} from '../controllers/word.controller';
import { checkAttempts } from '../middlewares/attempts';
import { createUserFactory } from '../factories/create-user.factory';
import { getUserDataFactory } from '../factories/get-user-data.factory';
import { signInFactory } from '../factories/sign-in.factory';
import { getUserStatisticFactory } from '../factories/get-user-statistic.factory';
import { getUserAttemptsFactory } from '../factories/get-user-attempts.factory';
import { getRandomWordFactory } from '../factories/get-random-word.factory';
import { registerSuccessAttemptFactory } from '../factories/register-success-attempt.factory';
import { registerFailedAttemptFactory } from '../factories/register-failed-attempt.factory';
import { registerSkippedAttemptFactory } from '../factories/register-skipped-attempt.factory';
import { deleteSkippedAttemptFactory } from '../factories/delete-skipped-attempt.factory';
import { getLeaderboardFactory } from '../factories/get-leaderboard.factory';
import { refreshTokenFactory } from '../controllers/refresh-token.controller';
import { forgotPasswordFactory } from '../factories/forgot-password.factory';
import { refreshPasswordFactory } from '../factories/refresh-password.factory';

function setupRoutes(app: Express) {
  // Middleware global do Sentry para contexto
  app.use(sentryUserContext);

  //----------- Heath Check ------------//

  app.get('/', async (req, res) => {
    res.send('Hello World!');
  });

  app.get('/crash', async (req, res) => {
    throw new Error('Crash test');
  });

  app.post('/', async (_, res) => {
    try {
      res.status(200).json('Alive');
      return;
    } catch (error) {
      res.status(500).json('Internal Server Error');
    }
  });

  //----------- Auth Routes ------------//
  app.post('/sign-in', (req, res) => signInFactory().handle(req, res));

  app.post('/sign-up', (req, res) => createUserFactory().handle(req, res));

  app.get('/user-data', authenticate, (req, res) =>
    getUserDataFactory().handle(req, res)
  );

  app.get('/user-statistic', authenticate, (req, res) =>
    getUserStatisticFactory().handle(req, res)
  );

  app.get('/user-attempts', authenticate, (req, res) =>
    getUserAttemptsFactory().handle(req, res)
  );

  app.post('/refresh-token', (req, res) =>
    refreshTokenFactory().handle(req, res)
  );

  app.post('/forgot-password', (req, res) =>
    forgotPasswordFactory().handle(req, res)
  );

  app.post('/refresh-password', (req, res) =>
    refreshPasswordFactory().handle(req, res)
  );

  //----------- Word Routes ------------//

  app.get('/word', (req, res) => getRandomWordFactory().handle(req, res));

  //----------- Statistics Routes ------------//

  app.post('/attempt/success', authenticate, checkAttempts, (req, res) =>
    registerSuccessAttemptFactory().handle(req, res)
  );

  app.post('/attempt/fail', authenticate, checkAttempts, (req, res) =>
    registerFailedAttemptFactory().handle(req, res)
  );

  app.post(
    '/attempt/skipped/register',
    authenticate,
    checkAttempts,
    (req, res) => registerSkippedAttemptFactory().handle(req, res)
  );

  app.delete(
    '/attempt/skipped/delete',
    authenticate,
    checkAttempts,
    (req, res) => deleteSkippedAttemptFactory().handle(req, res)
  );

  //----------- LeaderBoard Routes ------------//

  app.get('/leaderboard', (req, res) =>
    getLeaderboardFactory().handle(req, res)
  );
}

export default setupRoutes;
