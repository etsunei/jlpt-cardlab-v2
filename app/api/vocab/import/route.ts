import { NextResponse } from "next/server";
import { parseVocabFile } from "@/lib/vocab";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const text = await file.text();
  const type = file.name.toLowerCase().endsWith(".json") ? "json" : "csv";
  const entries = parseVocabFile(text, type);
  const supabase = createSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ data: entries, warning: "Supabase not configured; returning normalized entries only." });
  }

  const { error } = await supabase.from("vocab_entries").upsert(entries, { onConflict: "id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inserted: entries.length });
}
