export type AuthStatus = "locked" | "unlocked";

export type AuthErrorCode =
  | "CANCELLED"
  | "FAILED"
  | "NOT_AVAILABLE"
  | "IN_FLIGHT";

/**
 * Authentication levels determine how recently authentication is required
 * - TRUSTED: Low-risk actions (toggle todo) - 5 minute grace period
 * - SENSITIVE: Medium-risk actions (add todo) - 2 minute grace period
 * - CRITICAL: High-risk actions (delete, clear) - always require auth
 */
export enum AuthLevel {
  TRUSTED = "TRUSTED",
  SENSITIVE = "SENSITIVE",
  CRITICAL = "CRITICAL",
}

export type AuthResult =
  | { ok: true }
  | {
      ok: false;
      code: AuthErrorCode;
      message: string;
    };

export type AuthState = {
  status: AuthStatus;
  /**
   * Placeholder for Phase_1.
   * We will store/compute an "authenticated recently enough" timestamp.
   */
  lastAuthenticatedAtMs: number | null;
};
