// Shared PDF upload constraints. Used by both the client validator and the
// server-side finalize step so user-facing rules and server checks stay in
// sync. Bump these in one place when limits change.
export const PDF_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const PDF_ALLOWED_MIME = "application/pdf" as const;
export const PDF_ALLOWED_EXT = ".pdf" as const;
export const PDF_MAX_PAGES = 50;

export function isValidPdfFile(file: File): { ok: true } | { ok: false; reason: string } {
  const name = file.name.toLowerCase();
  if (!name.endsWith(PDF_ALLOWED_EXT)) {
    return { ok: false, reason: "Only .pdf files are allowed." };
  }
  // Some browsers report an empty MIME for PDFs dragged from certain sources;
  // accept that as long as the extension matches.
  if (file.type && file.type !== PDF_ALLOWED_MIME) {
    return { ok: false, reason: "File must be a PDF document." };
  }
  if (file.size > PDF_MAX_BYTES) {
    return { ok: false, reason: "File exceeds 10MB limit." };
  }
  if (file.size === 0) {
    return { ok: false, reason: "File is empty." };
  }
  return { ok: true };
}