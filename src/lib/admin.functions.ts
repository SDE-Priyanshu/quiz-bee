import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ADMIN_EMAIL = "priyanshuvns2008@gmail.com";

export const verifyAdminPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { password: string }) => {
    if (!data || typeof data.password !== "string") {
      throw new Error("Invalid input");
    }
    if (data.password.length > 200) throw new Error("Invalid input");
    return data;
  })
  .handler(async ({ data, context }) => {
    const adminEmail = (process.env.ADMIN_EMAIL ?? ADMIN_EMAIL).toLowerCase();
    const userId = context.userId;
    if (!userId) {
      return { ok: false as const, reason: "forbidden" as const };
    }
    // Look up the authoritative user record server-side rather than trusting
    // the JWT's `email` claim, which can be stale after an email change.
    const { data: userRes, error: userErr } =
      await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr || !userRes?.user) {
      return { ok: false as const, reason: "forbidden" as const };
    }
    const callerEmail = userRes.user.email?.toLowerCase() ?? "";
    const emailConfirmed = !!userRes.user.email_confirmed_at;
    if (!callerEmail || !emailConfirmed || callerEmail !== adminEmail) {
      return { ok: false as const, reason: "forbidden" as const };
    }
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      return { ok: false as const, reason: "not_configured" as const };
    }
    // Constant-time-ish compare
    const a = data.password;
    const b = expected;
    let mismatch = a.length === b.length ? 0 : 1;
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
      mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    }
    return { ok: mismatch === 0, reason: mismatch === 0 ? "ok" as const : "invalid" as const };
  });