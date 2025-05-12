import { Statistic } from "../config/db/models/statistic"
import { EStatistics } from "../constants/statistic"
import { SkippedAttemptRepository } from "../repositories/skipped_attempt.repository"

export const createSkippedStatistics = async () => {
  try {
    const skippedAttemptDocuments = await SkippedAttemptRepository.find({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      },
    })

    if(skippedAttemptDocuments.isSuccess() && skippedAttemptDocuments.value.length > 0) {
      const formattedDocuments = skippedAttemptDocuments.value.map(reg => (
        {
          wordId: reg.wordId,
          userId: reg.userId,
          type: EStatistics.SKIPPED,
        }
      ))

      await Statistic.insertMany(formattedDocuments)

      console.log('Skipped Statistics Created')
    }
  } catch (error) {
    console.log(error)
  }
}