import { NextResponse } from "next/server";
import sampleVocab from "@/data/sample-vocab.json";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level");
  const q = searchParams.get("q")?.toLowerCase();
  const supabase = createSupabaseAdmin();

  if (supabase) {
    let query = supabase.from("vocab_entries").select("*").order("priority", { ascending: false });
    if (level && level !== "ALL") query = query.eq("jlpt_level", level);
    if (q) query = query.or(`word.ilike.%${q}%,reading.ilike.%${q}%,meaning_cn.ilike.%${q}%,meaning_en.ilike.%${q}%`);
    const { data, error } = await query.limit(200);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  const data = (sampleVocab as typeof sampleVocab).filter((entry) => {
    const levelMatch = !level || level === "ALL" || entry.jlpt_level === level;
    const haystack = `${entry.word} ${entry.reading} ${entry.meaning_cn} ${entry.meaning_en}`.toLowerCase();
    return levelMatch && (!q || haystack.includes(q));
  });

  return NextResponse.json({ data });
}
