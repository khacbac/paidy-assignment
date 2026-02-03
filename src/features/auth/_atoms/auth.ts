import { atom } from "jotai";
import {
  clearLastAuthenticatedAtMs,
  getLastAuthenticatedAtMs,
  setLastAuthenticatedAtMs,
} from "../secureAuthStorage";
import { isSessionValid } from "../session";
import type { AuthState } from "../types";

const initialAuthState: AuthState = {
  status: "locked",
  lastAuthenticatedAtMs: null,
};

export const authStateAtom = atom<AuthState>(initialAuthState);
export const authHydratedAtom = atom(false);

export const refreshAuthAtom = atom(null, async (_get, set) => {
  try {
    const persisted = await getLastAuthenticatedAtMs();
    const nowMs = Date.now();
    const valid = persisted != null && isSessionValid(persisted, nowMs);
    set(authStateAtom, {
      status: valid ? "unlocked" : "locked",
      lastAuthenticatedAtMs: persisted,
    });
  } finally {
    set(authHydratedAtom, true);
  }
});

export const lockAuthAtom = atom(null, async (_get, set) => {
  await clearLastAuthenticatedAtMs();
  set(authStateAtom, (prev) => ({
    ...prev,
    status: "locked",
    lastAuthenticatedAtMs: null,
  }));
});

export const unlockAuthAtom = atom(
  null,
  async (_get, set, lastAuthenticatedAtMs: number) => {
    await setLastAuthenticatedAtMs(lastAuthenticatedAtMs);
    set(authStateAtom, { status: "unlocked", lastAuthenticatedAtMs });
  }
);
