export enum EStatistics {
  PLAYED = "played",
  CORRECT = "correct",
  INCORRECT = "incorrect",
  SKIPPED = "skipped",
}

export const BASE_SCORE = 150;

export const ATTEMPT_SCORES = {
  1: 100,
  2: 80,
  3: 60,
  4: 40,
  5: 20,
  6: 10
} as const;

export const BONUS_SCORES = {
  PERFECT_GAME: 50,
  STREAK_5: 10,
  STREAK_10: 25,
  HIGH_WIN_RATE: 5
} as const;

export const HIGH_WIN_RATE_THRESHOLD = 0.9;