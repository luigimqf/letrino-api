import { UsedWordRepository } from "../repositories/used_word.repository"
import { WordRepository } from "../repositories/word.repository";

export const updateUsedWords = async () => {
  try {
    const usedWordResult = await UsedWordRepository.countDocuments({ deletedAt: undefined });

    const wordsResult = await WordRepository.countDocuments();

    if(usedWordResult.isSuccess() && wordsResult.isSuccess()) {
      if(usedWordResult.value === wordsResult.value) {
        await UsedWordRepository.updateMany(
          { deletedAt: undefined },
          { deletedAt: new Date() }
        )
        console.log(`Updated UsedWords`)
      }
    }

    console.log("updateUsedWords")
  } catch (error) {
    console.log(error)
  }
}