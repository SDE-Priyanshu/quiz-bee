import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "pdfs";
const MAX_BYTES = 10 * 1024 * 1024;

function sanitizeTitle(raw: string): string {
  const trimmed = (raw ?? "").toString().trim().slice(0, 200);
  return trimmed.length > 0 ? trimmed : "Untitled.pdf";
}

/**
 * Reserve a row in `pdf_uploads` BEFORE the bytes hit Storage so the
 * client can upload to a deterministic per-user path. Status stays
 * 'uploaded' (initial enum value) and is flipped to 'ready' by
 * finalizePdfUpload once the object lands in the bucket.
 */
export const createPdfUploadRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { title: string; size_bytes: number }) => {
    if (!data || typeof data.title !== "string") throw new Error("Invalid input");
    if (typeof data.size_bytes !== "number" || !Number.isFinite(data.size_bytes)) {
      throw new Error("Invalid size");
    }
    if (data.size_bytes <= 0) throw new Error("File is empty");
    if (data.size_bytes > MAX_BYTES) throw new Error("File exceeds 10MB limit");
    return { title: sanitizeTitle(data.title), size_bytes: Math.floor(data.size_bytes) };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("pdf_uploads")
      .insert({
        user_id: userId,
        title: data.title,
        original_filename: data.title,
        // Placeholder; replaced with the real object key below so the row
        // is never persisted without a path (column is NOT NULL).
        storage_path: "pending",
        size_bytes: data.size_bytes,
        status: "uploaded",
      })
      .select("id")
      .single();
    if (error || !row) {
      throw new Error(error?.message ?? "Failed to create upload record");
    }
    const storage_path = `${userId}/${row.id}.pdf`;
    const { error: updErr } = await supabase
      .from("pdf_uploads")
      .update({ storage_path })
      .eq("id", row.id);
    if (updErr) {
      // Best-effort cleanup so we don't strand a row with `pending` path.
      await supabase.from("pdf_uploads").delete().eq("id", row.id);
      throw new Error(updErr.message);
    }
    return { pdfId: row.id as string, storage_path, bucket: BUCKET };
  });

/**
 * Verify the object exists under the user's prefix and flip status to 'ready'.
 * Storage RLS already prevents cross-user reads, but we re-check ownership
 * by listing the path with the user-scoped client.
 */
export const finalizePdfUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { pdfId: string }) => {
    if (!data?.pdfId || typeof data.pdfId !== "string") throw new Error("Invalid input");
    return { pdfId: data.pdfId };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("pdf_uploads")
      .select("id, storage_path, user_id")
      .eq("id", data.pdfId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row || row.user_id !== userId) throw new Error("Not found");

    // Confirm object presence via a head request.
    const folder = row.storage_path.split("/").slice(0, -1).join("/");
    const filename = row.storage_path.split("/").pop()!;
    const { data: list, error: listErr } = await supabase.storage
      .from(BUCKET)
      .list(folder, { search: filename, limit: 1 });
    if (listErr) throw new Error(listErr.message);
    if (!list || list.length === 0) {
      await supabase
        .from("pdf_uploads")
        .update({ status: "failed", error_message: "Object missing in storage" })
        .eq("id", row.id);
      throw new Error("Upload did not complete");
    }

    const { data: updated, error: updErr } = await supabase
      .from("pdf_uploads")
      .update({ status: "ready", error_message: null })
      .eq("id", row.id)
      .select("*")
      .single();
    if (updErr) throw new Error(updErr.message);
    return updated;
  });

export const failPdfUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { pdfId: string; reason?: string }) => {
    if (!data?.pdfId) throw new Error("Invalid input");
    return { pdfId: data.pdfId, reason: (data.reason ?? "Upload failed").slice(0, 500) };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase
      .from("pdf_uploads")
      .update({ status: "failed", error_message: data.reason })
      .eq("id", data.pdfId)
      .eq("user_id", userId);
    return { ok: true as const };
  });

export const listMyPdfs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("pdf_uploads")
      .select("id, title, original_filename, size_bytes, status, page_count, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deletePdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { pdfId: string }) => {
    if (!data?.pdfId) throw new Error("Invalid input");
    return { pdfId: data.pdfId };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("pdf_uploads")
      .select("id, storage_path, user_id")
      .eq("id", data.pdfId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row || row.user_id !== userId) throw new Error("Not found");
    await supabase.storage.from(BUCKET).remove([row.storage_path]);
    const { error: delErr } = await supabase
      .from("pdf_uploads")
      .delete()
      .eq("id", row.id);
    if (delErr) throw new Error(delErr.message);
    return { ok: true as const };
  });