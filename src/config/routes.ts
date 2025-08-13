import { signIn, forgotPassword, refreshToken, refreshPassword, signUp, getUserData } from '../controllers/auth.controller'
import { getLeaderboard } from '../controllers/leaderboard.controller'
import { Express } from 'express'
import { authenticate } from '../middlewares/authenticate'
import { sentryUserContext } from '../middlewares/sentry'
import { getWord, attemptFail, registerSkippedAttemp,deleteSkippedAttempDocument, attemptSuccess } from '../controllers/word.controller'
import { checkAttempts } from '../middlewares/attempts'
import { env } from './enviroment'

function setupRoutes(app: Express) {
  // Middleware global do Sentry para contexto
  app.use(sentryUserContext)

  //----------- Heath Check ------------//

  app.get('/', async (req, res) => {
    res.send('Hello World!')
  });
  
  app.post('/', async (_, res) => {
    try {
      res.status(200).json('Alive')
      return 
    } catch (error) {
      res.status(500).json('Internal Server Error')
    }
  })

  app.get('/debug', async (req, res) => {
    throw new Error('Debugging error')
  });

  app.get('/env', async (req, res) => {
    res.status(200).json({
      NODE_ENV: env.NODE_ENV,
      PORT: env.NODE_ENV,
      MONGODB_URI: env.NODE_ENV,
      JWT_SECRET: env.NODE_ENV,
      EMAIL_USER: env.NODE_ENV,
      EMAIL_PASSWORD: env.NODE_ENV,
      ALLOWED_ORIGIN: env.NODE_ENV,
      SENTRY_DSN: env.NODE_ENV,
      PASSWORD_RESET_URL: env.NODE_ENV,
    })
  });

  //----------- Auth Routes ------------//
  app.post('/sign-in', signIn);

  app.post('/sign-up', signUp);

  app.get('/user-data',authenticate, getUserData)

  app.post('/refresh-token',refreshToken)

  app.post('/forgot-password', forgotPassword)

  app.post('/refresh-password', refreshPassword)

  //----------- Word Routes ------------//

  app.get('/word', getWord);

  //----------- Statistics Routes ------------//

  app.post('/attempt/success', authenticate, checkAttempts, attemptSuccess);

  app.post('/attempt/fail', authenticate, checkAttempts, attemptFail);

  app.post('/attempt/skipped/register', authenticate, checkAttempts, registerSkippedAttemp);

  app.delete('/attempt/skipped/delete', authenticate, checkAttempts, deleteSkippedAttempDocument)
  
  //----------- LeaderBoard Routes ------------//

  app.get('/leaderboard', getLeaderboard)
}

export default setupRoutes
