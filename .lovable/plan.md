
# PrepZo Production Implementation Plan

Built on the audit. No code changes in this plan — implementation only after you approve.

---

## 1. Database Architecture (Lovable Cloud / Postgres)

All tables in `public.*`, RLS enabled, GRANTs explicit, `auth.uid()` ownership, `created_at`/`updated_at` triggers.

```text
auth.users (managed)
   │
   ├── profiles (1:1)                full_name, avatar_url, exam_pref, onboarded_at
   ├── user_roles (1:N)              role enum: admin | moderator | user
   │
   ├── pdf_uploads (1:N)             storage_path, filename, size_bytes, page_count,
   │     │                           extraction_status, extracted_text, char_count
   │     │
   │     └── tests (1:N)             exam, difficulty, question_count, source_pdf_id,
   │           │                     ai_model, generation_status, title
   │           │
   │           ├── test_questions (1:N)  stem, options jsonb, correct_index,
   │           │                          explanation, topic
   │           │
   │           └── test_attempts (1:N)   started_at, submitted_at, score,
   │                 │                   correct_count, total, time_taken_s,
   │                 │                   answers jsonb (qid → selected_index)
   │
   ├── community_messages (1:N)      body, parent_id (nullable, for replies)
   │     └── community_likes (M:N)   message_id + user_id (unique)
   │
   ├── feedback (1:N)                category, subject, body, status, admin_note
   └── notifications (1:N)           type, title, body, read_at
```

Key rules:
- `profiles` auto-created via `handle_new_user()` trigger on `auth.users` insert.
- `user_roles` checked via `has_role(uid, role)` security-definer function — never read from client.
- Replace hardcoded admin email in `src/lib/roles.ts` with a `user_roles` row seeded once.
- `tests` and `test_questions` written by server-only code (admin client) after AI generation; clients read via `requireSupabaseAuth` scoped to `owner_id = auth.uid()`.

---

## 2. Required Supabase Tables (summary)

| Table | Owner column | RLS shape |
|---|---|---|
| profiles | id = auth.uid() | self read/update; admin read all |
| user_roles | user_id | self read; admin read/write |
| pdf_uploads | user_id | self CRUD |
| tests | user_id | self CRUD; admin read all |
| test_questions | via tests.user_id | self read; service writes |
| test_attempts | user_id | self CRUD; admin read all |
| community_messages | user_id | authenticated read all; self insert/update/delete |
| community_likes | user_id | authenticated read all; self insert/delete |
| feedback | user_id | self read own; admin read all; auth insert |
| notifications | user_id | self read/update |

All public tables get `GRANT SELECT, INSERT, UPDATE, DELETE ... TO authenticated; GRANT ALL ... TO service_role;` in the same migration. No `anon` grants — everything is auth-gated.

Realtime publication: `community_messages`, `community_likes`, `notifications`.

---

## 3. Required Storage Buckets

| Bucket | Public | Purpose | Policies |
|---|---|---|---|
| `pdfs` | private | source study material | user can read/write only objects under `{auth.uid()}/...` |
| `avatars` | public | profile pictures | self write under `{auth.uid()}/...`; world read |

Path convention: `pdfs/{user_id}/{pdf_id}.pdf` — RLS on `storage.objects` uses `(storage.foldername(name))[1] = auth.uid()::text`.

---

## 4. AI Integration Architecture

Use Lovable AI Gateway (`LOVABLE_API_KEY` already present). No user key required.

- **Model:** `google/gemini-2.5-flash` for MCQ generation (cost/latency balance), upgradable to `gemini-2.5-pro` for "hard" difficulty.
- **Boundary:** all calls live in `createServerFn` under `src/lib/ai.functions.ts`. Never called from the browser.
- **Prompt shape:** system prompt enforces exam (JEE/NEET/CBSE), difficulty, count, and a strict JSON schema. Use Gemini structured output / response schema, validated with Zod (`{ questions: [{ stem, options: [4], correct_index: 0..3, explanation, topic }] }`).
- **Failure handling:** retry once with stricter "JSON only" reminder; on second failure return typed `{ error: "generation_failed" }` to the client.
- **Persistence:** on success, server fn writes `tests` + `test_questions` rows transactionally using `supabaseAdmin`, returns `testId`. The test player loads questions by `testId`, not from session storage.
- **Rate limit:** per-user, in-DB counter table or simple in-process map keyed by `userId` (e.g. 20 generations / 24h for free tier).

---

## 5. PDF Processing Architecture

Goal: turn the uploaded PDF into clean text the AI can ground questions in.

- **Upload:** browser uploads directly to `pdfs/{uid}/{uuid}.pdf` via `supabase.storage` (signed). A `pdf_uploads` row is inserted with `extraction_status='pending'`.
- **Extraction:** server fn `extractPdfText({ pdfId })` runs in the Worker:
  - Library: **`unpdf`** (pure JS, Worker-compatible). `pdfjs-dist` and `pdf-parse` are Node-only and will break under Cloudflare workerd.
  - Downloads object via `supabaseAdmin.storage.from('pdfs').download(...)`, runs `extractText`, writes `extracted_text` + `char_count` + `page_count`, sets `extraction_status='ready'`.
  - Hard limits: 10 MB, 50 pages, ~120k chars (truncate + warn).
- **Generation handoff:** `generateTest({ pdfId, exam, count, difficulty })` requires `extraction_status='ready'`, chunks text if >30k tokens, then calls AI gateway.
- **No client-side PDF parsing.** Dashboard removes the fake `setInterval` upload simulation.

---

## 6. Community Architecture

- **Source of truth:** `community_messages` table, not in-memory `SEED`.
- **Server fns:** `listMessages({ cursor })` (keyset paginated, newest first), `postMessage({ body, parent_id? })`, `deleteOwnMessage({ id })`, `toggleLike({ messageId })`.
- **Realtime:** browser subscribes to `postgres_changes` on `community_messages` + `community_likes`; new posts and like counts arrive without refresh.
- **Validation:** Zod — body 1–2000 chars, strip HTML, basic profanity filter (later).
- **Moderation:** `moderator` / `admin` role can delete any message via `has_role`.

---

## 7. Admin Analytics Architecture

Replace the four "Coming soon" cards with live data.

- **Server fn:** `getAdminStats()` with `.middleware([requireSupabaseAuth])` + server-side `has_role(userId, 'admin')` check. Returns:
  - `users_total`, `users_new_7d`
  - `tests_generated_total`, `tests_generated_7d`
  - `attempts_total`, `avg_score`
  - `pdfs_uploaded_total`, `storage_bytes_used`
  - `community_messages_7d`, `feedback_open_count`
- **Implementation:** single SQL function `public.admin_stats()` (SECURITY DEFINER, role-gated inside the function) returning a JSON row — one round trip.
- **Tables list:** paginated `getAdminUsers({ cursor, search })`, `getAdminFeedback({ status })`.
- **Keep:** existing password-gate as a second factor on top of role check.

---

## 8. Exact Implementation Order

Each step is independently shippable and unblocks the next.

1. **Schema migration #1 — identity**
   `profiles`, `user_roles`, `app_role` enum, `has_role()`, `handle_new_user()` trigger, GRANTs, RLS. Seed your account as `admin`. Replace `src/lib/roles.ts` hardcoded email with a `has_role` server fn.

2. **Schema migration #2 — content**
   `pdf_uploads`, `tests`, `test_questions`, `test_attempts`, `feedback`, `notifications`. GRANTs, RLS, `updated_at` triggers.

3. **Storage buckets**
   Create `pdfs` (private) + `avatars` (public). Add `storage.objects` policies scoped to `auth.uid()` folder prefix.

4. **PDF upload (real)**
   Replace fake `setInterval` in `dashboard.tsx` with `supabase.storage` upload + `pdf_uploads` insert. Show real progress.

5. **PDF extraction server fn**
   Add `unpdf`, build `extractPdfText` server fn, call it right after upload completes. Persist text.

6. **AI MCQ server fn**
   `generateTest` server fn → Lovable AI Gateway → Zod-validated JSON → write `tests` + `test_questions`. Returns `testId`.

7. **Test player rewrite**
   `src/routes/test.tsx` fetches by `testId` via server fn instead of generating fake "Statement A/B/C/D". Submission writes a `test_attempts` row.

8. **My Tests rewrite**
   `src/routes/tests.tsx` reads `test_attempts` via server fn instead of `localStorage`. Remove the localStorage key.

9. **Community rewrite**
   Replace `SEED` with `listMessages` + `postMessage` server fns + Realtime subscription.

10. **Feedback persistence**
    `src/routes/feedback.tsx` inserts into `feedback` table instead of discarding.

11. **Admin analytics**
    `admin_stats()` SQL fn + `getAdminStats` server fn + role gate. Wire the four cards + users/feedback tables.

12. **Notifications persistence (optional polish)**
    Move `useNotifications` from in-memory to `notifications` table with Realtime.

13. **Hardening pass**
    Per-user generation rate limit, file-size/page-count enforcement server-side, error boundaries on every route loader, run `supabase--linter` and fix warnings.

14. **Publish + smoke test**
    Generate a real test end-to-end as a non-admin user; verify admin dashboard reflects it.

---

## Out of scope (call out, don't build now)

- Payments / pro tier
- Email digests (Resend)
- Mobile push notifications
- Multi-language MCQs
- Image-based questions (diagram OCR)

Reply with which step (or range) you want me to start with and I'll begin.
