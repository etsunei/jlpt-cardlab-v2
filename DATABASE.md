# Database Design

The canonical PostgreSQL schema is in `supabase/schema.sql`.

Core tables:

- `vocab_sources`: public source metadata and license notes.
- `vocab_entries`: normalized JLPT vocabulary items.
- `user_profiles`: per-user settings and target level.
- `user_vocab_flags`: favorites and important marks.
- `review_states`: current SM-2 state per user and vocabulary item.
- `review_logs`: immutable review events for analytics.
- `daily_stats`: daily aggregates for streaks, completion, heatmap, and forgetting rate.

RLS:

- Vocabulary entries and sources are publicly readable.
- User-owned records are protected by `auth.uid() = user_id`.

Data caveat:

JLPT has no official public vocabulary list. Store source names and URLs, and display them in product UI.
