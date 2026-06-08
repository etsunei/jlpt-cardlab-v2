import Papa from "papaparse";
import { VocabEntry, JlptLevel } from "@/lib/types";

const levels = new Set(["N5", "N4", "N3", "N2", "N1"]);

function normalizeLevel(value: unknown): JlptLevel {
  const raw = String(value ?? "N5").toUpperCase().replace(/^JLPT\s*/, "");
  return levels.has(raw) ? (raw as JlptLevel) : "N5";
}

function toTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(/[;,|]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function normalizeVocabRow(row: Record<string, unknown>, index = 0): VocabEntry {
  const word = String(row.word ?? row.kanji ?? row.expression ?? row.term ?? "").trim();
  const reading = String(row.reading ?? row.kana ?? row.hiragana ?? row.furigana ?? word).trim();
  const meaningEn = String(row.meaning_en ?? row.english ?? row.meaning ?? row.definition ?? "").trim();
  const meaningCn = String(row.meaning_cn ?? row.chinese ?? row.zh ?? row["中文"] ?? "").trim();

  return {
    id: String(row.id ?? `${normalizeLevel(row.jlpt_level ?? row.jlpt ?? row.level)}-${word || reading}-${index}`),
    word,
    reading,
    meaning_cn: meaningCn || meaningEn,
    meaning_en: meaningEn || meaningCn,
    jlpt_level: normalizeLevel(row.jlpt_level ?? row.jlpt ?? row.level),
    part_of_speech: String(row.part_of_speech ?? row.pos ?? "").trim() || undefined,
    example: String(row.example ?? row.sentence ?? "").trim() || undefined,
    audio: String(row.audio ?? row.audio_url ?? "").trim() || undefined,
    tags: toTags(row.tags),
    source: String(row.source ?? "imported").trim(),
    priority: Number(row.priority ?? 50)
  };
}

export function parseVocabFile(input: string, type: "json" | "csv") {
  if (type === "json") {
    const parsed = JSON.parse(input);
    const rows = Array.isArray(parsed) ? parsed : parsed.items ?? parsed.vocabulary ?? [];
    return rows.map((row: Record<string, unknown>, index: number) => normalizeVocabRow(row, index));
  }

  const parsed = Papa.parse<Record<string, unknown>>(input, {
    header: true,
    skipEmptyLines: true
  });

  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors.map((error) => error.message).join("; "));
  }

  return parsed.data.map((row, index) => normalizeVocabRow(row, index));
}

export function exportAnkiTsv(entries: VocabEntry[]) {
  return entries
    .map((entry) =>
      [
        entry.word,
        entry.reading,
        entry.meaning_cn,
        entry.meaning_en,
        entry.jlpt_level,
        entry.example ?? "",
        entry.tags.join(" ")
      ]
        .map((cell) => String(cell).replace(/\t/g, " ").replace(/\n/g, "<br>"))
        .join("\t")
    )
    .join("\n");
}
