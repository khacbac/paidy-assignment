import { useStore } from "jotai/react";
import type { Getter, Setter } from "jotai/vanilla";

import { authStateAtom, lockAuthAtom, unlockAuthAtom } from "./_atoms/auth";

import { authenticateLocal } from "./localAuth";
import { isSessionValid, isSessionValidForLevel } from "./session";
import { AuthLevel } from "./types";
import type { AuthResult, AuthState } from "./types";

export { isSessionValid, isSessionValidForLevel };

let authInFlight = false;

/**
 * Ensure the user is authenticated "recently enough" based on auth level.
 *
 * - Fast path: valid session for the given level => unlock and return ok.
 * - Slow path: prompt local auth and persist timestamp on success.
 * - Cancel/fail: remain locked and return an error result.
 *
 * @param level Authentication level (TRUSTED, SENSITIVE, CRITICAL)
 */
export async function ensureAuthenticated(
  get: Getter,
  set: Setter,
  reason: string,
  level: AuthLevel = AuthLevel.TRUSTED
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

  if (isSessionValidForLevel(state.lastAuthenticatedAtMs, level, nowMs)) {
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
 * Hook that exposes ensureAuthenticated(reason, level) and lock() using the current Jotai store.
 * Use this in components (e.g. Settings harness, later todo actions).
 */
export function useAuthGate() {
  const store = useStore();
  return {
    ensureAuthenticated: (reason: string, level?: AuthLevel) =>
      ensureAuthenticated(store.get, store.set, reason, level),
    lock: () => store.set(lockAuthAtom),
  };
}
