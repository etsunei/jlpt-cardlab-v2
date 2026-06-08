"use client";

import { useLearningStore } from "@/stores/learning-store";
import { Button } from "@/components/ui/button";
import { JlptLevel } from "@/lib/types";

const levels: Array<JlptLevel | "ALL"> = ["ALL", "N5", "N4", "N3", "N2", "N1"];

export function LevelFilter() {
  const selected = useLearningStore((state) => state.selectedLevel);
  const setLevel = useLearningStore((state) => state.setLevel);

  return (
    <div className="flex flex-wrap gap-2">
      {levels.map((level) => (
        <Button key={level} size="sm" variant={selected === level ? "default" : "outline"} onClick={() => setLevel(level)}>
          {level === "ALL" ? "全部" : level}
        </Button>
      ))}
    </div>
  );
}
