"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import sampleVocab from "@/data/sample-vocab.json";
import { DailyStats, JlptLevel, ReviewRating, ReviewState, VocabEntry } from "@/lib/types";
import { formatDateKey } from "@/lib/utils";
import { scheduleReview } from "@/lib/srs";

type LearningStore = {
  entries: VocabEntry[];
  selectedLevel: JlptLevel | "ALL";
  favorites: string[];
  important: string[];
  review: Record<string, ReviewState>;
  daily: DailyStats[];
  setLevel: (level: JlptLevel | "ALL") => void;
  toggleFavorite: (id: string) => void;
  toggleImportant: (id: string) => void;
  upsertEntries: (entries: VocabEntry[]) => void;
  rate: (entry: VocabEntry, rating: ReviewRating) => void;
  dueEntries: () => VocabEntry[];
  newEntries: (limit?: number) => VocabEntry[];
};

function updateDaily(daily: DailyStats[], patch: Partial<DailyStats>) {
  const today = formatDateKey();
  const existing = daily.find((item) => item.date === today) ?? {
    date: today,
    learned: 0,
    reviewed: 0,
    correct: 0,
    total: 0
  };
  const next = { ...existing, ...patch };
  return [...daily.filter((item) => item.date !== today), next].sort((a, b) => a.date.localeCompare(b.date));
}

export const useLearningStore = create<LearningStore>()(
  persist(
    (set, get) => ({
      entries: sampleVocab as VocabEntry[],
      selectedLevel: "ALL",
      favorites: [],
      important: [],
      review: {},
      daily: [],
      setLevel: (level) => set({ selectedLevel: level }),
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id) ? state.favorites.filter((item) => item !== id) : [...state.favorites, id]
        })),
      toggleImportant: (id) =>
        set((state) => ({
          important: state.important.includes(id) ? state.important.filter((item) => item !== id) : [...state.important, id]
        })),
      upsertEntries: (entries) =>
        set((state) => {
          const merged = new Map(state.entries.map((entry) => [entry.id, entry]));
          entries.forEach((entry) => merged.set(entry.id, entry));
          return { entries: Array.from(merged.values()) };
        }),
      rate: (entry, rating) =>
        set((state) => {
          const next = scheduleReview(state.review[entry.id], rating);
          next.vocab_id = entry.id;
          const isCorrect = rating !== "again";
          return {
            review: { ...state.review, [entry.id]: next },
            daily: updateDaily(state.daily, {
              reviewed: (state.daily.find((item) => item.date === formatDateKey())?.reviewed ?? 0) + 1,
              correct: (state.daily.find((item) => item.date === formatDateKey())?.correct ?? 0) + (isCorrect ? 1 : 0),
              total: (state.daily.find((item) => item.date === formatDateKey())?.total ?? 0) + 1
            })
          };
        }),
      dueEntries: () => {
        const now = Date.now();
        return get().entries.filter((entry) => {
          const state = get().review[entry.id];
          return state && new Date(state.due_at).getTime() <= now;
        });
      },
      newEntries: (limit = 12) => {
        const { entries, review, selectedLevel } = get();
        return entries
          .filter((entry) => selectedLevel === "ALL" || entry.jlpt_level === selectedLevel)
          .filter((entry) => !review[entry.id])
          .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
          .slice(0, limit);
      }
    }),
    {
      name: "jlpt-cardlab-learning"
    }
  )
);
