import { ReviewRating, ReviewState } from "@/lib/types";
import { clamp } from "@/lib/utils";

const ratingQuality: Record<ReviewRating, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5
};

export function scheduleReview(current: ReviewState | undefined, rating: ReviewRating, now = new Date()): ReviewState {
  const previous: ReviewState =
    current ?? {
      vocab_id: "",
      due_at: now.toISOString(),
      interval_days: 0,
      ease_factor: 2.5,
      repetitions: 0,
      lapses: 0,
      mastered: false
    };

  const quality = ratingQuality[rating];
  let ease = previous.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  ease = clamp(ease, 1.3, 3);

  let repetitions = previous.repetitions;
  let lapses = previous.lapses;
  let interval = previous.interval_days;

  if (rating === "again") {
    repetitions = 0;
    lapses += 1;
    interval = 0;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = rating === "hard" ? 1 : rating === "easy" ? 4 : 2;
    else if (repetitions === 2) interval = rating === "hard" ? 3 : rating === "easy" ? 8 : 6;
    else interval = Math.round(interval * (rating === "hard" ? 1.2 : rating === "easy" ? ease * 1.35 : ease));
  }

  const due = new Date(now);
  if (rating === "again") due.setMinutes(due.getMinutes() + 10);
  else due.setDate(due.getDate() + Math.max(1, interval));

  return {
    ...previous,
    due_at: due.toISOString(),
    interval_days: interval,
    ease_factor: ease,
    repetitions,
    lapses,
    last_rating: rating,
    mastered: repetitions >= 5 && interval >= 21
  };
}
