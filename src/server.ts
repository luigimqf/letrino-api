process.env.TZ = 'UTC';

import './utils/crash-handler';
import 'reflect-metadata';
import 'dotenv/config';
import setupApp from './config/app';
import { env } from './config/enviroment';

const app = setupApp();

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
