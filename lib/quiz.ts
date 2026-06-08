import { QuizMode, QuizQuestion, VocabEntry } from "@/lib/types";
import { shuffle } from "@/lib/utils";

function pickChoices(entries: VocabEntry[], answer: string, mapper: (entry: VocabEntry) => string) {
  return shuffle([
    answer,
    ...shuffle(entries)
      .map(mapper)
      .filter((choice) => choice && choice !== answer)
      .slice(0, 3)
  ]);
}

export function createQuiz(entries: VocabEntry[], mode: QuizMode, count = 10): QuizQuestion[] {
  const pool = shuffle(entries).slice(0, count);

  return pool.map((vocab) => {
    if (mode === "cn-jp" || mode === "spelling") {
      return {
        id: `${mode}-${vocab.id}`,
        mode,
        prompt: vocab.meaning_cn || vocab.meaning_en,
        answer: vocab.word,
        choices: pickChoices(entries, vocab.word, (entry) => entry.word),
        vocab
      };
    }

    if (mode === "listening") {
      return {
        id: `${mode}-${vocab.id}`,
        mode,
        prompt: vocab.reading,
        answer: vocab.word,
        choices: pickChoices(entries, vocab.word, (entry) => entry.word),
        vocab
      };
    }

    return {
      id: `${mode}-${vocab.id}`,
      mode,
      prompt: vocab.word,
      answer: vocab.meaning_cn || vocab.meaning_en,
      choices: pickChoices(entries, vocab.meaning_cn || vocab.meaning_en, (entry) => entry.meaning_cn || entry.meaning_en),
      vocab
    };
  });
}
