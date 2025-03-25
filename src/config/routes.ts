import { login, refreshToken } from '../controllers/auth.controller'
import { getLeaderboard, updateScore } from '../controllers/leaderboard.controller'
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser
} from '../controllers/user.controller'
import { Express } from 'express'
import { authenticate } from '../middlewares/authenticate'

function setupRoutes(app: Express) {
  //----------- Auth Routes ------------//
  app.post('/login', login);

  app.post('/refresh-token',refreshToken)
  
  //----------- User Routes ------------//
  app.get('/users', getUsers)

  app.post('/user', createUser)

  app.get('/user/:id', getUser)

  app.delete('/user/:id', deleteUser)

  app.put('/user/:id', updateUser)

  //----------- Word Routes ------------//

  //----------- LeaderBoard Routes ------------//

  app.get('/leaderboard', getLeaderboard)

  app.put('/leaderboard/:id',authenticate ,updateScore)
}

export default setupRoutes
