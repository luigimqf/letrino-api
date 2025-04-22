import { CronJob } from "cron"
import { updateUsedWords } from "./used_words";

export const setupCron = () => {
  return new CronJob('30 23 * * * *', updateUsedWords,
    null,
    true
  );
}