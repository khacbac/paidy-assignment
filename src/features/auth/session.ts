import { AUTH_TTL_MS } from "./constants";

/**
 * Session policy:
 * - A session starts at `lastAuthenticatedAtMs`.
 * - It remains valid for `AUTH_TTL_MS` (5 minutes by default).
 * - At or beyond TTL, a fresh local authentication is required.
 */
export function isSessionValid(
  lastAuthenticatedAtMs: number | null,
  nowMs: number
): boolean {
  if (lastAuthenticatedAtMs == null) return false;
  return nowMs - lastAuthenticatedAtMs < AUTH_TTL_MS;
}

export function getSessionRemainingMs(
  lastAuthenticatedAtMs: number | null,
  nowMs: number
): number {
  if (lastAuthenticatedAtMs == null) return 0;
  return Math.max(0, AUTH_TTL_MS - (nowMs - lastAuthenticatedAtMs));
}
