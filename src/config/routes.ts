import { login, refreshToken } from '../controllers/auth.controller'
import { getLeaderboard, updateScore } from '../controllers/leaderboard.controller'
import {
  createUser,
} from '../controllers/user.controller'
import { Express } from 'express'
import { authenticate } from '../middlewares/authenticate'

function setupRoutes(app: Express) {
  //----------- Auth Routes ------------//
  app.post('/login', login);

  app.post('/refresh-token',refreshToken)
  
  //----------- User Routes ------------//

  app.post('/user', createUser)

  //----------- Word Routes ------------//

  //----------- LeaderBoard Routes ------------//

  app.get('/leaderboard/:id', getLeaderboard)

  app.put('/leaderboard/:id',authenticate ,updateScore)
}

export default setupRoutes
