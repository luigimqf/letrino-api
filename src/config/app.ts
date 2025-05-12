import { setupCron } from '../workers/cron'
import setupDatabase from './db'
import setupRoutes from './routes'
import express from 'express'

function setupApp() {
  const app = express()
  app.use(express.json())
  setupDatabase()
  setupRoutes(app)
  setupCron()
  return app
}

export default setupApp
