export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export type ReviewRating = "again" | "hard" | "good" | "easy";

export type VocabEntry = {
  id: string;
  word: string;
  reading: string;
  meaning_cn: string;
  meaning_en: string;
  jlpt_level: JlptLevel;
  part_of_speech?: string;
  example?: string;
  audio?: string;
  tags: string[];
  source?: string;
  priority?: number;
};

export type ReviewState = {
  vocab_id: string;
  due_at: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  lapses: number;
  last_rating?: ReviewRating;
  mastered: boolean;
};

export type DailyStats = {
  date: string;
  learned: number;
  reviewed: number;
  correct: number;
  total: number;
};

export type QuizMode = "jp-cn" | "cn-jp" | "spelling" | "listening" | "mock";

export type QuizQuestion = {
  id: string;
  mode: QuizMode;
  prompt: string;
  answer: string;
  choices: string[];
  vocab: VocabEntry;
};
