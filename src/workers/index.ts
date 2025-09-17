import { CronJob } from 'cron';
import { updateUsedWords } from './words';

export const setupCron = () => {
  new CronJob('30 23 * * *', updateUsedWords, null, true);

  return;
};
