import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ADMIN_EMAIL = "priyanshuvns2008@gmail.com";

// In-process rate limiter keyed by userId. Best-effort: a single Worker
// isolate may serve many requests, so this materially slows brute-force
// attempts even though it is not shared across isolates.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRate(userId: string): boolean {
  const now = Date.now();
  const entry = attempts.get(userId);
  if (!entry || entry.resetAt < now) {
    attempts.set(userId, { count: 0, resetAt: now + WINDOW_MS });
    return true;
  }
  return entry.count < MAX_ATTEMPTS;
}

function recordFailure(userId: string) {
  const now = Date.now();
  const entry = attempts.get(userId);
  if (!entry || entry.resetAt < now) {
    attempts.set(userId, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearAttempts(userId: string) {
  attempts.delete(userId);
}

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
    if (!checkRate(userId)) {
      return { ok: false as const, reason: "rate_limited" as const };
    }
    // Look up the authoritative user record server-side rather than trusting
    // the JWT's `email` claim, which can be stale after an email change.
    const { data: userRes, error: userErr } =
      await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr || !userRes?.user) {
      recordFailure(userId);
      return { ok: false as const, reason: "forbidden" as const };
    }
    const callerEmail = userRes.user.email?.toLowerCase() ?? "";
    const emailConfirmed = !!userRes.user.email_confirmed_at;
    if (!callerEmail || !emailConfirmed || callerEmail !== adminEmail) {
      recordFailure(userId);
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
    if (mismatch === 0) {
      clearAttempts(userId);
      return { ok: true as const, reason: "ok" as const };
    }
    recordFailure(userId);
    return { ok: false as const, reason: "invalid" as const };
  });