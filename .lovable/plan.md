# Phase 2 — Cloud PDF Storage (Plan)

Backend-only work. Existing dashboard UI (drag/drop card, progress bar, file chip, config panel, Generate button) stays pixel-identical — we only swap the fake `setInterval` for a real Supabase Storage upload and persist a row in `pdf_uploads`.

---

## 1. What will be changed

### Storage (Lovable Cloud)
- Use the existing private `pdfs` bucket (already created in Stage 1).
- Add RLS policies on `storage.objects` so a user can only read/write objects under their own folder prefix `{auth.uid()}/...`.
- Set bucket config: `file_size_limit = 10485760` (10 MB), `allowed_mime_types = ['application/pdf']` — enforced server-side by Supabase even if a client bypasses the UI.

### Database
- `pdf_uploads` already exists from Stage 1. Confirm/extend columns:
  `id, user_id, storage_path, filename, size_bytes, mime_type, page_count, extraction_status, extracted_text, char_count, upload_status, created_at, updated_at`.
- Add `upload_status` enum (`uploading | ready | failed`) if missing, default `uploading`.
- RLS: self-CRUD via `auth.uid() = user_id`; admin read-all via `has_role`.
- Index on `(user_id, created_at desc)` for "my uploads" list later.

### Server functions (`src/lib/pdfs.functions.ts`)
- `createPdfUploadRecord({ filename, size_bytes })` — auth-gated. Returns `{ pdfId, storage_path }` where path = `{userId}/{pdfId}.pdf`. Inserts row with `upload_status='uploading'`.
- `finalizePdfUpload({ pdfId })` — verifies the object exists in storage under the user's prefix, flips `upload_status='ready'`, returns the row.
- `failPdfUpload({ pdfId, reason })` — marks `failed`, used by client on error.
- `listMyPdfs()` / `getPdf({ pdfId })` — for future PDF list / preview screens.
- `deletePdf({ pdfId })` — removes storage object + row (future-ready).
- All use `requireSupabaseAuth`; nothing public.

### Client (`src/routes/dashboard.tsx`)
- Replace the fake `setInterval` progress simulation with:
  1. Client-side validation: MIME `application/pdf`, extension `.pdf`, size ≤ 10 MB.
  2. Call `createPdfUploadRecord` → get `{ pdfId, storage_path }`.
  3. `supabase.storage.from('pdfs').uploadToSignedUrl(...)` using a server-issued signed upload URL so we get real XHR progress events. (Falls back to `.upload()` if signed-URL path fails.)
  4. Track real `progress` via XHR `onUploadProgress`; same progress bar UI.
  5. On success → `finalizePdfUpload({ pdfId })`, stash `pdfId` in state (replaces the current "file in memory" approach), keep the existing `notify()` toast.
  6. On error → `failPdfUpload`, show `toast.error` with the existing error styles, surface a Retry action on the file chip.
- `pdfId` is what later stages (extraction, AI generation) consume — no UI added now, just the id flowing through.

### Config
- No `.env` changes needed (Storage uses existing Supabase keys).
- `MAX_BYTES` constant moves to a shared `src/lib/pdf-config.ts` so server + client agree.

---

## 2. Why it is needed

- **Permanence**: today the file lives only in browser memory and a fake progress bar — refresh wipes it. Cloud storage + DB row makes uploads survive logout, refresh, and redeploys.
- **Security**: per-folder RLS on `storage.objects` is the only way to keep one user from listing/downloading another user's PDFs even if they guess the path.
- **Validation defense in depth**: client checks UX, bucket `allowed_mime_types` + `file_size_limit` enforce the same rules server-side, RLS enforces ownership.
- **Real progress**: signed-URL upload exposes true byte progress and a real failure surface — the current `setInterval` lies to users on slow networks.
- **Foundation for Stages 5–7**: extraction, AI generation, and "My Tests" all key off `pdf_uploads.id`. Without a persisted row, none of them can work.

---

## 3. Files that will be modified

**New**
- `src/lib/pdfs.functions.ts` — server fns above.
- `src/lib/pdf-config.ts` — shared constants (`MAX_BYTES`, allowed MIME, max pages).
- `supabase/migrations/<timestamp>_pdf_storage_hardening.sql` — storage.objects policies, bucket limits, `upload_status` enum/column + index if not present.

**Modified**
- `src/routes/dashboard.tsx` — swap fake upload for real one; keep markup, classes, animations, and copy intact. Only the handlers change.

**Not modified**
- Every other route, component, style file, theme token, layout, and the `pdfs` bucket name itself.
- `src/integrations/supabase/*` auto-generated files.

---

## 4. Possible risks

| Risk | Mitigation |
|---|---|
| Migration runs before code referencing new columns ships → temporary type mismatch. | Migration is additive (new enum + column with default). Existing rows get `upload_status='ready'` backfill in the same migration. |
| `storage.objects` policy typo → user can't upload or can see others' files. | Policies scoped to `(storage.foldername(name))[1] = auth.uid()::text` for SELECT/INSERT/UPDATE/DELETE. Verified via a quick post-deploy curl as two users. |
| Bucket `allowed_mime_types` blocks a legitimately-PDF file with wrong reported MIME (rare iOS Safari case). | Client also checks extension; we set MIME to `application/pdf` explicitly on upload so Supabase trusts it. |
| Signed upload URL approach not supported by some older browsers. | Fallback to direct `supabase.storage.upload()` with `onUploadProgress` via the JS SDK's `XMLHttpRequest` path. |
| 10 MB cap rejects a real user file. | Limit is in one shared constant; trivial to raise. Error message tells the user the cap. |
| Orphan storage objects if `finalizePdfUpload` never runs (tab closed mid-upload). | Row stays `upload_status='uploading'`; future cleanup job (or `deletePdf`) can prune rows older than 1h with no object. Out of scope for this phase but designed for. |
| RLS regression on `pdf_uploads` from earlier migration. | Re-assert policies in the new migration with `DROP POLICY IF EXISTS ... CREATE POLICY ...` to be idempotent. |
| Rollback: code expects new column, migration reverted. | Migration is forward-only but additive; rollback = drop the column + enum. Code degrades to "upload always shows ready" — no data loss. |

---

## Implementation order (after approval)

1. Migration: `upload_status` enum/column + index + `storage.objects` policies + bucket limits.
2. `src/lib/pdf-config.ts` + `src/lib/pdfs.functions.ts`.
3. Rewrite handlers in `src/routes/dashboard.tsx` (markup untouched).
4. Smoke test: upload as user A, confirm row + object; sign in as user B, confirm cannot list/download A's path; oversized file rejected; wrong MIME rejected.

Reply **approve** to proceed, or tell me what to change.