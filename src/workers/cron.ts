import { CronJob } from "cron"
import { updateUsedWords } from "./words";
import { createSkippedStatistics } from "./attempt";

export const setupCron = () => {
  new CronJob('30 23 * * *', updateUsedWords, null, true);

  new CronJob('0 0 * * *', createSkippedStatistics, null, true);
  return 
}