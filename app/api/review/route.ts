import { NextResponse } from "next/server";
import { scheduleReview } from "@/lib/srs";
import { ReviewRating, ReviewState } from "@/lib/types";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    user_id?: string;
    vocab_id: string;
    rating: ReviewRating;
    current?: ReviewState;
  };

  if (!body.vocab_id || !body.rating) return NextResponse.json({ error: "vocab_id and rating are required" }, { status: 400 });
  const next = scheduleReview(body.current, body.rating);
  next.vocab_id = body.vocab_id;

  const supabase = createSupabaseAdmin();
  if (supabase && body.user_id) {
    const { error } = await supabase.from("review_states").upsert(
      {
        user_id: body.user_id,
        vocab_id: body.vocab_id,
        due_at: next.due_at,
        interval_days: next.interval_days,
        ease_factor: next.ease_factor,
        repetitions: next.repetitions,
        lapses: next.lapses,
        last_rating: body.rating,
        mastered: next.mastered
      },
      { onConflict: "user_id,vocab_id" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: next });
}
