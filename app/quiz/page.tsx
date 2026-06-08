"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LevelFilter } from "@/components/level-filter";
import { createQuiz } from "@/lib/quiz";
import { QuizMode } from "@/lib/types";
import { useLearningStore } from "@/stores/learning-store";
import { speakJapanese } from "@/components/vocab-card";

const modes: Array<{ id: QuizMode; label: string }> = [
  { id: "jp-cn", label: "日→中" },
  { id: "cn-jp", label: "中→日" },
  { id: "spelling", label: "拼写题" },
  { id: "listening", label: "听力题" },
  { id: "mock", label: "JLPT模拟" }
];

export default function QuizPage() {
  const entries = useLearningStore((state) => state.entries);
  const selectedLevel = useLearningStore((state) => state.selectedLevel);
  const [mode, setMode] = useState<QuizMode>("jp-cn");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const pool = entries.filter((entry) => selectedLevel === "ALL" || entry.jlpt_level === selectedLevel);
  const questions = useMemo(() => createQuiz(pool.length ? pool : entries, mode, 10), [pool, entries, mode]);
  const question = questions[index % questions.length];

  function submit(value: string) {
    const ok = value.trim() === question.answer.trim();
    setScore((current) => ({ correct: current.correct + (ok ? 1 : 0), total: current.total + 1 }));
    setAnswer("");
    setIndex((current) => current + 1);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-20 lg:pb-0">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">测验模式</h1>
        <p className="mt-2 text-sm text-muted-foreground">选择题、拼写题、听力题和 JLPT 模拟抽题会共用同一词库。</p>
      </div>
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <LevelFilter />
        <div className="flex flex-wrap gap-2">
          {modes.map((item) => (
            <Button key={item.id} size="sm" variant={mode === item.id ? "default" : "outline"} onClick={() => setMode(item.id)}>
              {item.label}
            </Button>
          ))}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>正确率 {score.total ? Math.round((score.correct / score.total) * 100) : 0}%</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg bg-muted p-6 text-center">
            <p className="text-sm text-muted-foreground">{question.vocab.jlpt_level}</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-normal">{mode === "listening" ? "听音选择" : question.prompt}</h2>
            {mode === "listening" ? (
              <Button className="mt-5" onClick={() => speakJapanese(question.vocab.reading)}>
                播放读音
              </Button>
            ) : null}
          </div>
          {mode === "spelling" ? (
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                submit(answer);
              }}
            >
              <Input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="输入日语单词" />
              <Button type="submit">提交</Button>
            </form>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {question.choices.map((choice) => (
                <Button key={choice} variant="outline" className="h-auto min-h-12 justify-start whitespace-normal py-3" onClick={() => submit(choice)}>
                  {choice}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
