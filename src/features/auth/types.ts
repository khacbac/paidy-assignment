export type AuthStatus = "locked" | "unlocked";

export type AuthErrorCode =
  | "CANCELLED"
  | "FAILED"
  | "NOT_AVAILABLE"
  | "IN_FLIGHT";

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
