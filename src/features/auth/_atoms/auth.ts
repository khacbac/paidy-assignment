import { atom } from "jotai";
import {
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

export const refreshAuthAtom = atom(null, async (_get, set) => {
  const persisted = await getLastAuthenticatedAtMs();
  const nowMs = Date.now();
  const valid = persisted != null && isSessionValid(persisted, nowMs);
  set(authStateAtom, {
    status: valid ? "unlocked" : "locked",
    lastAuthenticatedAtMs: persisted,
  });
});

export const lockAuthAtom = atom(null, (_get, set) => {
  set(authStateAtom, (prev) => ({ ...prev, status: "locked" }));
});

export const unlockAuthAtom = atom(
  null,
  async (_get, set, lastAuthenticatedAtMs: number) => {
    await setLastAuthenticatedAtMs(lastAuthenticatedAtMs);
    set(authStateAtom, { status: "unlocked", lastAuthenticatedAtMs });
  }
);
