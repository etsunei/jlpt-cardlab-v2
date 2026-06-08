# API Design

## `GET /api/vocab`

Query:

- `level`: `ALL | N5 | N4 | N3 | N2 | N1`
- `q`: keyword

Response:

```json
{ "data": [{ "word": "学生", "reading": "がくせい" }] }
```

## `POST /api/vocab/import`

Multipart form:

- `file`: `.csv` or `.json`

Normalizes rows into:

```json
{
  "word": "",
  "reading": "",
  "meaning_cn": "",
  "meaning_en": "",
  "jlpt_level": "",
  "example": "",
  "audio": "",
  "tags": []
}
```

## `POST /api/review`

Body:

```json
{
  "user_id": "uuid",
  "vocab_id": "n5-001",
  "rating": "good",
  "current": {}
}
```

Returns next SM-2 review state.

## `GET /api/quiz`

Query:

- `level`
- `mode`: `jp-cn | cn-jp | spelling | listening | mock`
- `count`

## `POST /api/ai`

Integration point for:

- AI example generation
- AI vocabulary explanation
- AI synonym comparison

## Auth

Supabase Auth providers:

- Email/password
- Google OAuth
- GitHub OAuth
