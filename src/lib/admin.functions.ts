import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
    const callerEmail =
      (context.claims as { email?: string } | undefined)?.email?.toLowerCase() ?? "";
    const adminEmail = (process.env.ADMIN_EMAIL ?? ADMIN_EMAIL).toLowerCase();
    if (!callerEmail || callerEmail !== adminEmail) {
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