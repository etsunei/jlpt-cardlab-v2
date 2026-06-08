"use client";

import { Bookmark, Star, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VocabEntry } from "@/lib/types";
import { useLearningStore } from "@/stores/learning-store";
import { cn } from "@/lib/utils";

export function speakJapanese(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export function VocabCard({ entry, compact = false }: { entry: VocabEntry; compact?: boolean }) {
  const favorites = useLearningStore((state) => state.favorites);
  const important = useLearningStore((state) => state.important);
  const toggleFavorite = useLearningStore((state) => state.toggleFavorite);
  const toggleImportant = useLearningStore((state) => state.toggleImportant);

  return (
    <Card className="overflow-hidden">
      <CardContent className={cn("p-5", compact && "p-4")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{entry.jlpt_level}</Badge>
              {entry.part_of_speech ? <Badge className="bg-accent text-accent-foreground">{entry.part_of_speech}</Badge> : null}
              {entry.tags.slice(0, 2).map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
            <h3 className="mt-4 text-3xl font-semibold tracking-normal">{entry.word}</h3>
            <p className="mt-1 text-lg text-muted-foreground">{entry.reading}</p>
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" title="发音" onClick={() => speakJapanese(entry.reading || entry.word)}>
              <Volume2 size={18} />
            </Button>
            <Button size="icon" variant="ghost" title="收藏" onClick={() => toggleFavorite(entry.id)}>
              <Bookmark size={18} className={cn(favorites.includes(entry.id) && "fill-current text-primary")} />
            </Button>
            <Button size="icon" variant="ghost" title="重点" onClick={() => toggleImportant(entry.id)}>
              <Star size={18} className={cn(important.includes(entry.id) && "fill-current text-amber-500")} />
            </Button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 text-sm">
          <p>
            <span className="text-muted-foreground">中文：</span>
            {entry.meaning_cn}
          </p>
          <p>
            <span className="text-muted-foreground">English: </span>
            {entry.meaning_en}
          </p>
          {entry.example ? <p className="rounded-md bg-muted p-3 text-muted-foreground">{entry.example}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
