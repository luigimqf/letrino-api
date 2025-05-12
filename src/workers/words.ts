import { UsedWordRepository } from "../repositories/used_word.repository"
import { WordRepository } from "../repositories/word.repository";

export const updateUsedWords = async () => {
  try {
    const usedWordResult = await UsedWordRepository.countDocuments({deletedAt: {$exists: false}});

    const wordsResult = await WordRepository.countDocuments();

    if(usedWordResult.isSuccess() && wordsResult.isSuccess()) {
      if(usedWordResult.value === wordsResult.value) {
        await UsedWordRepository.updateMany(
          {deletedAt: {$exists: false}},
          {$set: {deletedAt: new Date().toISOString()}}
        )
        console.log(`Updated UsedWords`)
      }
    }

    console.log("updateUsedWords")
  } catch (error) {
    console.log(error)
  }
}