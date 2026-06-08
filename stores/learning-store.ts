"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import sampleVocab from "@/data/sample-vocab.json";
import { DailyStats, JlptLevel, ReviewRating, ReviewState, VocabEntry } from "@/lib/types";
import { formatDateKey } from "@/lib/utils";
import { scheduleReview } from "@/lib/srs";

type LearningStore = {
  entries: VocabEntry[];
  fullVocabLoaded: boolean;
  fullVocabLoading: boolean;
  selectedLevel: JlptLevel | "ALL";
  groupSize: number;
  favorites: string[];
  important: string[];
  review: Record<string, ReviewState>;
  daily: DailyStats[];
  setLevel: (level: JlptLevel | "ALL") => void;
  setGroupSize: (size: number) => void;
  toggleFavorite: (id: string) => void;
  toggleImportant: (id: string) => void;
  upsertEntries: (entries: VocabEntry[]) => void;
  loadFullVocab: () => Promise<void>;
  completeLearning: (entry: VocabEntry) => void;
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
      fullVocabLoaded: false,
      fullVocabLoading: false,
      selectedLevel: "ALL",
      groupSize: 10,
      favorites: [],
      important: [],
      review: {},
      daily: [],
      setLevel: (level) => set({ selectedLevel: level }),
      setGroupSize: (size) => set({ groupSize: Math.min(100, Math.max(10, Math.round(size))) }),
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
      loadFullVocab: async () => {
        const { fullVocabLoaded, fullVocabLoading } = get();
        if (fullVocabLoaded || fullVocabLoading) return;

        set({ fullVocabLoading: true });
        try {
          const response = await fetch("/vocab/jlpt-vocab-elzup-normalized.json");
          if (!response.ok) throw new Error("Failed to load full vocabulary");
          const entries = (await response.json()) as VocabEntry[];
          const merged = new Map(get().entries.map((entry) => [entry.id, entry]));
          entries.forEach((entry) => merged.set(entry.id, entry));
          set({
            entries: Array.from(merged.values()),
            fullVocabLoaded: true,
            fullVocabLoading: false
          });
        } catch {
          set({ fullVocabLoading: false });
        }
      },
      completeLearning: (entry) =>
        set((state) => {
          const next = scheduleReview(state.review[entry.id], "good");
          next.vocab_id = entry.id;
          return {
            review: { ...state.review, [entry.id]: next },
            daily: updateDaily(state.daily, {
              learned: (state.daily.find((item) => item.date === formatDateKey())?.learned ?? 0) + 1,
              correct: (state.daily.find((item) => item.date === formatDateKey())?.correct ?? 0) + 1,
              total: (state.daily.find((item) => item.date === formatDateKey())?.total ?? 0) + 1
            })
          };
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
