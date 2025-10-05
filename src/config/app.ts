import 'reflect-metadata';
import { setupCron } from '../workers';
import setupDatabase from './db';
import setupRoutes from './routes';
import { sentryObservability } from './sentry';
import express from 'express';
import cors from 'cors';

function setupApp() {
  sentryObservability.init();

  const app = express();

  sentryObservability.setupExpressMiddlewares();

  app.use(express.json());
  app.use(cors());

  setupDatabase();
  setupCron();
  setupRoutes(app);

  sentryObservability.setupErrorHandler(app);

  return app;
}

export default setupApp;
