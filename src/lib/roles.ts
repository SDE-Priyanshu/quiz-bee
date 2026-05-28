import type { AuthUser } from "./auth";

export const ADMIN_EMAIL = "priyanshuvns2008@gmail.com";

export type Role = "guest" | "user" | "admin";

export function getRole(user: AuthUser | null): Role {
  if (!user) return "guest";
  if (user.isGuest) return "guest";
  if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return "admin";
  return "user";
}

export function isAdminEmail(email?: string | null) {
  return !!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}