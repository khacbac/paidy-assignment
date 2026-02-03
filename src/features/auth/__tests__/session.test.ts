import { AUTH_TTL_MS } from "@/features/auth/constants";
import { getSessionRemainingMs, isSessionValid } from "@/features/auth/session";

describe("session", () => {
  it("returns false when there is no authenticated timestamp", () => {
    expect(isSessionValid(null, Date.now())).toBe(false);
  });

  it("returns true when session age is below the TTL", () => {
    const now = 1_000_000;
    expect(isSessionValid(now - (AUTH_TTL_MS - 1), now)).toBe(true);
  });

  it("returns false when session age is exactly at the TTL", () => {
    const now = 1_000_000;
    expect(isSessionValid(now - AUTH_TTL_MS, now)).toBe(false);
  });

  it("calculates remaining time and clamps at zero", () => {
    const now = 1_000_000;
    expect(getSessionRemainingMs(now - 1_000, now)).toBe(AUTH_TTL_MS - 1_000);
    expect(getSessionRemainingMs(now - AUTH_TTL_MS - 1, now)).toBe(0);
    expect(getSessionRemainingMs(null, now)).toBe(0);
  });
});
