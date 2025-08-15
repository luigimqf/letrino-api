import { StatisticRepository } from "../repositories/statistic.repository"
import { EStatistics } from "../constants/statistic"
import { SkippedAttemptRepository } from "../repositories/skipped_attempt.repository"

export const createSkippedStatistics = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const skippedAttemptDocuments = await SkippedAttemptRepository.find({
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    });

    if(skippedAttemptDocuments.isSuccess() && skippedAttemptDocuments.value.length > 0) {
      const formattedDocuments = skippedAttemptDocuments.value.map(reg => ({
        wordId: reg.wordId,
        userId: reg.userId,
        type: EStatistics.SKIPPED,
      }));

      await StatisticRepository.insertMany(formattedDocuments);

      console.log('Skipped Statistics Created');
    }
  } catch (error) {
    console.log(error);
  }
}