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
  getWord,
  attemptFail,
  registerSkippedAttemp,
  deleteSkippedAttempDocument,
  attemptSuccess,
} from '../controllers/word.controller';
import { checkAttempts } from '../middlewares/attempts';
import { getStatistics } from '../controllers/statistic.controller';
import { getUserData } from '../controllers/user.controller';
import { getUserAttempts } from '../controllers/attempt.controller';

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
  app.post('/sign-in', signIn);

  app.post('/sign-up', signUp);

  app.get('/user-data', authenticate, getUserData);

  app.get('/user-statistic', authenticate, getStatistics);

  app.get('/user-attempts', authenticate, getUserAttempts);

  app.post('/refresh-token', refreshToken);

  app.post('/forgot-password', forgotPassword);

  app.post('/refresh-password', refreshPassword);

  //----------- Word Routes ------------//

  app.get('/word', getWord);

  //----------- Statistics Routes ------------//

  app.post('/attempt/success', authenticate, checkAttempts, attemptSuccess);

  app.post('/attempt/fail', authenticate, checkAttempts, attemptFail);

  app.post(
    '/attempt/skipped/register',
    authenticate,
    checkAttempts,
    registerSkippedAttemp
  );

  app.delete(
    '/attempt/skipped/delete',
    authenticate,
    checkAttempts,
    deleteSkippedAttempDocument
  );

  //----------- LeaderBoard Routes ------------//

  app.get('/leaderboard', getLeaderboard);
}

export default setupRoutes;
