import { StatisticRepository } from '../repositories/statistic.repository';
import { AttemptRepository } from '../repositories/attempt.repository';
import { EStatistics } from '../constants/statistic';
import { SkippedAttemptRepository } from '../repositories/skipped_attempt.repository';
import { DateUtils } from '../utils/date';
import { AppDataSource } from '../config/db/data-source';
import { Attempt, SkippedAttempt, Statistic } from '../config/db/entity';

export const createSkippedStatistics = async () => {
  try {
    const skippedAttemptRepository = new SkippedAttemptRepository(
      AppDataSource.getRepository(SkippedAttempt)
    );
    const statisticAttemptRepository = new StatisticRepository(
      AppDataSource.getRepository(Statistic)
    );
    const attemptRepository = new AttemptRepository(
      AppDataSource.getRepository(Attempt)
    );
    const today = DateUtils.startOfDayUTC();
    const tomorrow = DateUtils.endOfDayUTC();

    const skippedAttemptDocuments = await skippedAttemptRepository.find({
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    });

    if (
      skippedAttemptDocuments.isSuccess() &&
      skippedAttemptDocuments.value.length > 0
    ) {
      for (const skippedAttempt of skippedAttemptDocuments.value) {
        let statisticResult = await statisticAttemptRepository.findByUserId(
          skippedAttempt.userId
        );

        if (statisticResult.isFailure() || !statisticResult.value) {
          statisticResult = await statisticAttemptRepository.create(
            skippedAttempt.userId
          );
        }

        if (statisticResult.isSuccess() && statisticResult.value) {
          await attemptRepository.create({
            userId: skippedAttempt.userId,
            statisticId: statisticResult.value.id,
            wordId: skippedAttempt.wordId,
            result: EStatistics.SKIPPED,
            userInput: '',
          });

          await statisticAttemptRepository.updateGameResult({
            userId: skippedAttempt.userId,
            won: false,
            scoreIncrement: 0,
          });
        }
      }

      console.log('Skipped Statistics Created');
    }
  } catch (error) {
    console.log(error);
  }
};
