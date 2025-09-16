import { AttemptRepository } from '../repositories/attempt.repository';
import { EStatistics } from '../constants/statistic';
import { SkippedAttemptRepository } from '../repositories/skipped_attempt.repository';
import { DateUtils } from '../utils/date';
import { AppDataSource } from '../config/db/data-source';
import { Attempt, Match, SkippedAttempt } from '../config/db/entity';
import { MatchRepository } from '../repositories/match.repository';
import { EGameStatus } from '../constants/game';

export const createSkippedStatistics = async () => {
  try {
    const skippedAttemptRepository = new SkippedAttemptRepository(
      AppDataSource.getRepository(SkippedAttempt)
    );
    const matchRepository = new MatchRepository(
      AppDataSource.getRepository(Match)
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

    if (skippedAttemptDocuments.isFailure()) {
      console.log('Error fetching skipped attempts');
      return;
    }
    for (const skippedAttempt of skippedAttemptDocuments.value) {
      const newMatchResult = await matchRepository.create({
        userId: skippedAttempt.userId,
        result: EGameStatus.FAILED,
        wordId: skippedAttempt.wordId,
        score: 0,
      });

      if (newMatchResult.isFailure()) {
        console.log('Error creating match for skipped attempt');
        return;
      }

      const attemptResult = await attemptRepository.create({
        userId: skippedAttempt.userId,
        matchId: newMatchResult.value.id,
        wordId: skippedAttempt.wordId,
        result: EStatistics.SKIPPED,
      });

      if (attemptResult.isFailure()) {
        console.log('Error creating attempt for skipped attempt');
        return;
      }

      const matchUpdateResult = await matchRepository.update({
        id: newMatchResult.value.id,
        data: { attempts: [attemptResult.value] },
      });

      if (matchUpdateResult.isFailure()) {
        console.log('Error updating match with attempt');
        return;
      }

      console.log('Skipped Statistics Created');
    }
  } catch (error) {
    console.log(error);
  }
};
