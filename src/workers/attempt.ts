import { StatisticRepository } from "../repositories/statistic.repository"
import { AttemptRepository } from "../repositories/attempt.repository"
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
      
      for (const skippedAttempt of skippedAttemptDocuments.value) {
        // Buscar ou criar statistic do usuário
        let statisticResult = await StatisticRepository.findByUserId(skippedAttempt.userId);
        
        if(statisticResult.isFailure() || !statisticResult.value) {
          statisticResult = await StatisticRepository.create(skippedAttempt.userId);
        }

        if(statisticResult.isSuccess() && statisticResult.value) {
          // Criar attempt como SKIPPED
          await AttemptRepository.create({
            userId: skippedAttempt.userId,
            statisticId: statisticResult.value.id,
            wordId: skippedAttempt.wordId,
            result: EStatistics.SKIPPED
          });

          // Atualizar estatísticas (jogo perdido por skip)
          await StatisticRepository.updateGameResult(skippedAttempt.userId, false, 0);
        }
      }

      console.log('Skipped Statistics Created');
    }
  } catch (error) {
    console.log(error);
  }
}