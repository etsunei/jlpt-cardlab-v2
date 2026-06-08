"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VocabCard } from "@/components/vocab-card";
import { useLearningStore } from "@/stores/learning-store";
import { ReviewRating } from "@/lib/types";

const ratings: Array<{ id: ReviewRating; label: string; variant?: "danger" | "outline" | "secondary" | "default" }> = [
  { id: "again", label: "Again", variant: "danger" },
  { id: "hard", label: "Hard", variant: "outline" },
  { id: "good", label: "Good", variant: "secondary" },
  { id: "easy", label: "Easy", variant: "default" }
];

export default function ReviewPage() {
  const newEntries = useLearningStore((state) => state.newEntries);
  const dueEntries = useLearningStore((state) => state.dueEntries);
  const rate = useLearningStore((state) => state.rate);
  const [revealed, setRevealed] = useState(false);
  const due = dueEntries();
  const queue = due.length ? due : newEntries(10);
  const current = queue[0];

  if (!current) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h1 className="text-2xl font-semibold">今天没有待复习词条</h1>
          <p className="mt-2 text-muted-foreground">去学习页添加更多新词，系统会自动安排下一次复习。</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-20 lg:pb-0">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">智能复习</h1>
        <p className="mt-2 text-sm text-muted-foreground">队列 {queue.length} 张卡。先回忆，再翻开答案并评分。</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">{current.jlpt_level}</p>
          <h2 className="mt-3 text-5xl font-semibold tracking-normal">{current.word}</h2>
          <p className="mt-3 text-xl text-muted-foreground">{current.reading}</p>
          {!revealed ? (
            <Button className="mt-8" onClick={() => setRevealed(true)}>
              显示答案
            </Button>
          ) : null}
        </CardContent>
      </Card>
      {revealed ? (
        <>
          <VocabCard entry={current} compact />
          <div className="grid grid-cols-4 gap-2">
            {ratings.map((item) => (
              <Button
                key={item.id}
                variant={item.variant}
                onClick={() => {
                  rate(current, item.id);
                  setRevealed(false);
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
