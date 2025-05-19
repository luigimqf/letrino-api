import { setupCron } from '../workers/cron'
import setupDatabase from './db'
import setupRoutes from './routes'
import express from 'express'
import cors from 'cors';

function setupApp() {
  const app = express()
  app.use(express.json())
  app.use(cors())
  setupDatabase()
  setupCron()
  setupRoutes(app)
  return app
}

export default setupApp
