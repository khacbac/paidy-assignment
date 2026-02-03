export type AuthStatus = "locked" | "unlocked";

export type AuthState = {
  status: AuthStatus;
  /**
   * Placeholder for Phase_1.
   * We will store/compute an "authenticated recently enough" timestamp.
   */
  lastAuthenticatedAtMs: number | null;
};
