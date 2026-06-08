import { NextResponse } from "next/server";
import sampleVocab from "@/data/sample-vocab.json";
import { createQuiz } from "@/lib/quiz";
import { QuizMode, VocabEntry } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level") ?? "ALL";
  const mode = (searchParams.get("mode") ?? "jp-cn") as QuizMode;
  const count = Number(searchParams.get("count") ?? 10);
  const entries = (sampleVocab as VocabEntry[]).filter((entry) => level === "ALL" || entry.jlpt_level === level);
  return NextResponse.json({ data: createQuiz(entries, mode, count) });
}
