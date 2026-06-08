"use client";

import { CheckCircle2, ChevronLeft, ChevronRight, Headphones, Search, Settings2, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LevelFilter } from "@/components/level-filter";
import { speakJapanese } from "@/components/vocab-card";
import { VocabEntry } from "@/lib/types";
import { shuffle } from "@/lib/utils";
import { useLearningStore } from "@/stores/learning-store";

type Step = "memory" | "listening" | "spelling" | "done";

function displayMeaning(entry: VocabEntry) {
  return entry.meaning_cn || entry.meaning_en || "No meaning";
}

function makeMeaningChoices(entries: VocabEntry[], current: VocabEntry) {
  const answer = displayMeaning(current);
  return shuffle([
    answer,
    ...shuffle(entries)
      .filter((entry) => entry.id !== current.id)
      .map(displayMeaning)
      .filter(Boolean)
      .slice(0, 3)
  ]);
}

export default function LearnPage() {
  const entries = useLearningStore((state) => state.entries);
  const review = useLearningStore((state) => state.review);
  const selectedLevel = useLearningStore((state) => state.selectedLevel);
  const groupSize = useLearningStore((state) => state.groupSize);
  const setGroupSize = useLearningStore((state) => state.setGroupSize);
  const completeLearning = useLearningStore((state) => state.completeLearning);
  const fullVocabLoaded = useLearningStore((state) => state.fullVocabLoaded);
  const fullVocabLoading = useLearningStore((state) => state.fullVocabLoading);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState("all");
  const [groupIndex, setGroupIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [step, setStep] = useState<Step>("memory");
  const [spelling, setSpelling] = useState("");
  const [feedback, setFeedback] = useState("");

  const parts = useMemo(() => Array.from(new Set(entries.map((entry) => entry.part_of_speech).filter(Boolean))), [entries]);
  const filtered = entries.filter((entry) => {
    const levelMatch = selectedLevel === "ALL" || entry.jlpt_level === selectedLevel;
    const posMatch = pos === "all" || entry.part_of_speech === pos;
    const haystack = `${entry.word} ${entry.reading} ${entry.meaning_cn} ${entry.meaning_en}`.toLowerCase();
    return levelMatch && posMatch && haystack.includes(query.toLowerCase());
  });

  const learningPool = filtered
    .filter((entry) => !review[entry.id]?.mastered)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  const groupCount = Math.max(1, Math.ceil(learningPool.length / groupSize));
  const safeGroupIndex = Math.min(groupIndex, groupCount - 1);
  const group = learningPool.slice(safeGroupIndex * groupSize, safeGroupIndex * groupSize + groupSize);
  const current = group[Math.min(cardIndex, Math.max(0, group.length - 1))];
  const learnedInGroup = group.filter((entry) => Boolean(review[entry.id])).length;
  const progress = group.length ? Math.round((learnedInGroup / group.length) * 100) : 0;
  const choices = current ? makeMeaningChoices(entries, current) : [];

  function resetCard(nextIndex = cardIndex) {
    setCardIndex(nextIndex);
    setStep("memory");
    setSpelling("");
    setFeedback("");
  }

  function completeCurrent() {
    if (!current) return;
    completeLearning(current);
    const nextIndex = Math.min(cardIndex + 1, Math.max(0, group.length - 1));
    resetCard(nextIndex);
  }

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">分组学习</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          每个单词依次完成记忆、听音选意思、拼写三步后才算学完，并会自动进入间隔复习计划。
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <LevelFilter />
              <div className="flex flex-wrap gap-2">
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={pos} onChange={(event) => setPos(event.target.value)}>
                  <option value="all">全部词性</option>
                  {parts.map((part) => (
                    <option key={part} value={part}>
                      {part}
                    </option>
                  ))}
                </select>
                <div className="relative min-w-0 flex-1 md:w-72">
                  <Search className="pointer-events-none absolute left-3 top-2.5 text-muted-foreground" size={17} />
                  <Input className="pl-9" placeholder="搜索汉字、假名、释义" value={query} onChange={(event) => setQuery(event.target.value)} />
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[220px_1fr] sm:items-center">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Settings2 size={16} />
                每组单词数
              </label>
              <div className="flex items-center gap-3">
                <input
                  className="w-full accent-primary"
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={groupSize}
                  onChange={(event) => setGroupSize(Number(event.target.value))}
                />
                <Input className="w-20" type="number" min={10} max={100} value={groupSize} onChange={(event) => setGroupSize(Number(event.target.value))} />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              完整词库：{fullVocabLoaded ? "已加载" : fullVocabLoading ? "加载中" : "使用样例词库"}。当前筛选结果 {filtered.length} 个词。
            </p>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>
                  第 {safeGroupIndex + 1} 组 / 共 {groupCount} 组
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  本组 {group.length} 个词，完成 {learnedInGroup} 个，进度 {progress}%
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" disabled={safeGroupIndex === 0} onClick={() => { setGroupIndex(safeGroupIndex - 1); resetCard(0); }}>
                  <ChevronLeft size={18} />
                </Button>
                <Button variant="outline" size="icon" disabled={safeGroupIndex >= groupCount - 1} onClick={() => { setGroupIndex(safeGroupIndex + 1); resetCard(0); }}>
                  <ChevronRight size={18} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-5 h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>

              {current ? (
                <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                  <div className="rounded-lg border bg-background p-6 text-center">
                    <div className="flex justify-center gap-2">
                      <Badge>{current.jlpt_level}</Badge>
                      <Badge>{step === "memory" ? "记忆" : step === "listening" ? "听音选意思" : step === "spelling" ? "拼写" : "完成"}</Badge>
                    </div>
                    <h2 className="mt-5 text-5xl font-semibold tracking-normal">{current.word}</h2>
                    <p className="mt-3 text-xl text-muted-foreground">{current.reading}</p>
                    <Button className="mt-5" variant="outline" onClick={() => speakJapanese(current.reading || current.word)}>
                      <Volume2 size={18} />
                      发音
                    </Button>
                    <p className="mt-6 rounded-lg bg-muted p-4 text-left text-sm leading-6 text-muted-foreground">{displayMeaning(current)}</p>
                  </div>

                  <div className="rounded-lg border bg-background p-5">
                    {step === "memory" ? (
                      <div className="space-y-4">
                        <h3 className="font-semibold">1. 记忆</h3>
                        <p className="text-sm leading-6 text-muted-foreground">看汉字、假名和释义，确认自己已经记住后进入听力选择。</p>
                        <Button className="w-full" onClick={() => setStep("listening")}>
                          我记住了
                        </Button>
                      </div>
                    ) : null}

                    {step === "listening" ? (
                      <div className="space-y-4">
                        <h3 className="font-semibold">2. 听音选意思</h3>
                        <Button variant="outline" className="w-full" onClick={() => speakJapanese(current.reading || current.word)}>
                          <Headphones size={18} />
                          播放读音
                        </Button>
                        <div className="grid gap-2">
                          {choices.map((choice) => (
                            <Button
                              key={choice}
                              variant="outline"
                              className="h-auto justify-start whitespace-normal py-3 text-left"
                              onClick={() => {
                                if (choice === displayMeaning(current)) {
                                  setFeedback("正确，继续拼写。");
                                  setStep("spelling");
                                } else {
                                  setFeedback("再听一次，重新选择。");
                                }
                              }}
                            >
                              {choice}
                            </Button>
                          ))}
                        </div>
                        {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}
                      </div>
                    ) : null}

                    {step === "spelling" ? (
                      <form
                        className="space-y-4"
                        onSubmit={(event) => {
                          event.preventDefault();
                          const ok = spelling.trim() === current.word || spelling.trim() === current.reading;
                          if (ok) completeCurrent();
                          else setFeedback("拼写不对，可以输入汉字或假名。");
                        }}
                      >
                        <h3 className="font-semibold">3. 拼写</h3>
                        <p className="text-sm leading-6 text-muted-foreground">根据释义输入日语。可以输入汉字，也可以输入假名。</p>
                        <Input value={spelling} onChange={(event) => setSpelling(event.target.value)} placeholder="输入日语单词或读音" />
                        <Button className="w-full" type="submit">
                          <CheckCircle2 size={18} />
                          提交并完成
                        </Button>
                        {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}
                      </form>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border bg-background p-8 text-center text-muted-foreground">当前筛选没有可学习词条。</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>本组小卡片</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {group.map((entry, index) => {
              const active = current?.id === entry.id;
              const done = Boolean(review[entry.id]);
              return (
                <button
                  key={entry.id}
                  className={`rounded-md border p-3 text-left text-sm transition ${active ? "border-primary bg-primary/10" : "bg-background hover:bg-muted"}`}
                  onClick={() => resetCard(index)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{entry.word}</span>
                    {done ? <CheckCircle2 size={15} className="text-primary" /> : null}
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{entry.reading}</p>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
