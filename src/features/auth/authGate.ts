import { useStore } from "jotai/react";

import { authStateAtom, lockAuthAtom, unlockAuthAtom } from "./_atoms/auth";

import { authenticateLocal } from "./localAuth";
import { isSessionValid } from "./session";
import type { AuthResult, AuthState } from "./types";

export { isSessionValid };

let authInFlight = false;

/**
 * Ensure the user is authenticated "recently enough" (Phase_1: 5min TTL).
 *
 * - Fast path: valid session => unlock and return ok.
 * - Slow path: prompt local auth and persist timestamp on success.
 * - Cancel/fail: remain locked and return an error result.
 */
export async function ensureAuthenticated(
  get: <T>(atom: { read: unknown }) => T,
  set: (atom: unknown, ...args: unknown[]) => void | Promise<void>,
  reason: string
): Promise<AuthResult> {
  if (authInFlight) {
    return {
      ok: false,
      code: "IN_FLIGHT",
      message: "Authentication is already in progress.",
    };
  }

  const state = get(authStateAtom);
  const nowMs = Date.now();

  if (isSessionValid(state.lastAuthenticatedAtMs, nowMs)) {
    set(authStateAtom, (prev: AuthState) => ({ ...prev, status: "unlocked" }));
    return { ok: true };
  }

  authInFlight = true;
  try {
    const result = await authenticateLocal({ reason });
    if (!result.ok) {
      set(lockAuthAtom);
      return { ok: false, code: result.code, message: result.message };
    }

    await set(unlockAuthAtom, nowMs);
    return { ok: true };
  } finally {
    authInFlight = false;
  }
}

/**
 * Hook that exposes ensureAuthenticated(reason) and lock() using the current Jotai store.
 * Use this in components (e.g. Settings harness, later todo actions).
 */
export function useAuthGate() {
  const store = useStore();
  return {
    ensureAuthenticated: (reason: string) =>
      ensureAuthenticated(store.get, store.set, reason),
    lock: () => store.set(lockAuthAtom),
  };
}
