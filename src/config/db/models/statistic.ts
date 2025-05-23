import mongoose from 'mongoose'
import { EStatistics } from '../../../constants/statistic';
import { IStatistic } from '../../models/statistic';

const statisticSchema = new mongoose.Schema<IStatistic>({
  wordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Words",
    required: true,
  },
  attempt: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(EStatistics),
    required: true,
  },
}, {timestamps: true});

export const Statistic = mongoose.model('Statistics', statisticSchema)

