"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { LevelFilter } from "@/components/level-filter";
import { VocabCard } from "@/components/vocab-card";
import { Input } from "@/components/ui/input";
import { useLearningStore } from "@/stores/learning-store";

export default function LearnPage() {
  const entries = useLearningStore((state) => state.entries);
  const selectedLevel = useLearningStore((state) => state.selectedLevel);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState("all");

  const parts = useMemo(() => Array.from(new Set(entries.map((entry) => entry.part_of_speech).filter(Boolean))), [entries]);
  const filtered = entries.filter((entry) => {
    const levelMatch = selectedLevel === "ALL" || entry.jlpt_level === selectedLevel;
    const posMatch = pos === "all" || entry.part_of_speech === pos;
    const haystack = `${entry.word} ${entry.reading} ${entry.meaning_cn} ${entry.meaning_en}`.toLowerCase();
    return levelMatch && posMatch && haystack.includes(query.toLowerCase());
  });

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">单词学习</h1>
        <p className="mt-2 text-sm text-muted-foreground">按等级、词性和关键词快速定位，收藏与重点标记会保存在本地或 Supabase 用户记录中。</p>
      </div>
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <LevelFilter />
        <div className="flex gap-2">
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
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((entry) => (
          <VocabCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
