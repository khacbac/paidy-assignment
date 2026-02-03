import { createStore } from "jotai";

import { authStateAtom } from "@/features/auth/_atoms/auth";
import { AUTH_TTL_MS } from "@/features/auth/constants";
import { ensureAuthenticated } from "@/features/auth/authGate";
import { authenticateLocal } from "@/features/auth/localAuth";

jest.mock("@/features/auth/localAuth", () => ({
  authenticateLocal: jest.fn(),
}));

const mockedAuthenticateLocal = jest.mocked(authenticateLocal);

describe("ensureAuthenticated", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns ok without prompting when session is still valid", async () => {
    const store = createStore();
    const now = 1_000_000;
    jest.spyOn(Date, "now").mockReturnValue(now);

    store.set(authStateAtom, {
      status: "locked",
      lastAuthenticatedAtMs: now - (AUTH_TTL_MS - 1),
    });

    const result = await ensureAuthenticated(store.get, store.set, "Auth");

    expect(result).toEqual({ ok: true });
    expect(mockedAuthenticateLocal).not.toHaveBeenCalled();
    expect(store.get(authStateAtom).status).toBe("unlocked");

    jest.restoreAllMocks();
  });

  it("prompts and unlocks when session is expired and auth succeeds", async () => {
    const store = createStore();
    const now = 2_000_000;
    jest.spyOn(Date, "now").mockReturnValue(now);
    mockedAuthenticateLocal.mockResolvedValueOnce({ ok: true });

    store.set(authStateAtom, {
      status: "locked",
      lastAuthenticatedAtMs: now - AUTH_TTL_MS,
    });

    const result = await ensureAuthenticated(
      store.get,
      store.set,
      "Authenticate to continue"
    );

    expect(result).toEqual({ ok: true });
    expect(mockedAuthenticateLocal).toHaveBeenCalledWith({
      reason: "Authenticate to continue",
    });
    expect(store.get(authStateAtom)).toEqual({
      status: "unlocked",
      lastAuthenticatedAtMs: now,
    });

    jest.restoreAllMocks();
  });

  it("locks and returns error when local auth fails", async () => {
    const store = createStore();
    mockedAuthenticateLocal.mockResolvedValueOnce({
      ok: false,
      code: "FAILED",
      message: "Authentication failed.",
    });

    store.set(authStateAtom, {
      status: "unlocked",
      lastAuthenticatedAtMs: 1,
    });

    const result = await ensureAuthenticated(store.get, store.set, "Auth");
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 0);
    });

    expect(result).toEqual({
      ok: false,
      code: "FAILED",
      message: "Authentication failed.",
    });
    expect(store.get(authStateAtom).status).toBe("locked");
    expect(store.get(authStateAtom).lastAuthenticatedAtMs).toBeNull();
  });
});
