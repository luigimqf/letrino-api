export enum EAttemptStatus {
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
}

export const ATTEMPT_SCORES = {
  1: 100,
  2: 85,
  3: 70,
  4: 55,
  5: 40,
  6: 25,
} as const;

export const BONUS_SCORES = {
  PERFECT_GAME: 50,
  STREAK_5: 10,
  STREAK_10: 25,
  HIGH_WIN_RATE: 5,
} as const;

export const HIGH_WIN_RATE_THRESHOLD = 0.9;
