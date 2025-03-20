import { login } from '../controllers/auth.controller'
import { getLeaderboard } from '../controllers/leaderboard.controller'
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser
} from '../controllers/user.controller'
import { Express } from 'express'

function setupRoutes(app: Express) {
  //----------- Auth Routes ------------//
  app.post('/login', login)
  //----------- User Routes ------------//
  app.get('/users', getUsers)

  app.post('/user', createUser)

  app.get('/user/:id', getUser)

  app.delete('/user/:id', deleteUser)

  app.put('/user/:id', updateUser)

  //----------- Word Routes ------------//

  //----------- LeaderBoard Routes ------------//

  app.get('/leaderboard', getLeaderboard)
}

export default setupRoutes
