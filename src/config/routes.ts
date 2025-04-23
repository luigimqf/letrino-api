import { login, forgotPassword, refreshToken, refreshPassword } from '../controllers/auth.controller'
import { getLeaderboard, updateScore } from '../controllers/leaderboard.controller'
import {
  createUser,
} from '../controllers/user.controller'
import { Express } from 'express'
import { authenticate } from '../middlewares/authenticate'
import { getWord, wordFail, wordSuccess } from '../controllers/word.controller'

function setupRoutes(app: Express) {
  //----------- Heath Check ------------//
  app.get('/', async (_, res) => {
    try {
      res.status(200).json('Alive')
      return 
    } catch (error) {
      res.status(500).json('Internal Server Error')
    }
  })
  //----------- Auth Routes ------------//
  app.post('/login', login);

  app.post('/refresh-token',refreshToken)

  app.post('/forgot-password', forgotPassword)

  app.post('/refresh-password', refreshPassword)
  
  //----------- User Routes ------------//

  app.post('/user', createUser)

  //----------- Word Routes ------------//

  app.get('/word', getWord);

  //----------- Statistics Routes ------------//

  app.post('/attempt/success', authenticate, wordSuccess);

  app.post('/attempt/fail', authenticate, wordFail);

  // app.post('/attempt/skipped', authenticate, wordSkipped);
  
  //----------- LeaderBoard Routes ------------//

  app.get('/leaderboard/:id',authenticate, getLeaderboard)

  app.put('/leaderboard/:id',authenticate ,updateScore)
}

export default setupRoutes
