/* eslint-disable @typescript-eslint/no-explicit-any */
import { WordRepository } from '../repositories/word.repository';
import { AppDataSource } from '../config/db/data-source';
import { DateUtils } from '../utils/date';
import { Word } from '../config/db/entity';

export const updateUsedWords = async () => {
  try {
    const repository = new WordRepository(AppDataSource.getRepository(Word));
    const totalWordsResult = await repository.countDocuments();

    if (totalWordsResult.isFailure()) {
      console.error('Failed to get total words count');
      return;
    }

    const totalWords = totalWordsResult.value;

    if (totalWords === 0) {
      console.log('No words available in database');
      return;
    }

    const query = `
      SELECT 
        u.id as userId,
        COUNT(uw.id) as usedWordsCount
      FROM users u
      LEFT JOIN used_words uw ON u.id = uw.userId AND uw.deletedAt IS NULL
      GROUP BY u.id
      HAVING COUNT(uw.id) >= ?
    `;

    const usersWithAllWordsUsed = await AppDataSource.query(query, [
      totalWords,
    ]);

    if (usersWithAllWordsUsed.length === 0) {
      console.log('No users have used all available words');
      return;
    }

    const userIds = usersWithAllWordsUsed.map((row: any) => row.userId);

    console.log(
      `Found ${userIds.length} users who have used all ${totalWords} words`
    );

    const updateResult = await AppDataSource.createQueryBuilder()
      .update('used_words')
      .set({ deletedAt: DateUtils.now() })
      .where('userId IN (:...userIds)', { userIds })
      .andWhere('deletedAt IS NULL')
      .execute();

    console.log(
      `Updated ${updateResult.affected} used_words records for ${userIds.length} users`
    );

    if (userIds.length <= 10) {
      console.log(`Updated used_words for users: ${userIds.join(', ')}`);
    } else {
      console.log(
        `Updated used_words for ${userIds.length} users (too many to list)`
      );
    }
  } catch (error) {
    console.error('Error in updateUsedWords:', error);
  }
};
