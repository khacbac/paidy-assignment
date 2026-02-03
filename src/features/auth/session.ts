import { AUTH_TTL_MS } from "./constants";
import type { AuthLevel } from "./types";

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

/**
 * Check if session is valid for a specific auth level
 */
export function isSessionValidForLevel(
  lastAuthenticatedAtMs: number | null,
  level: AuthLevel,
  nowMs = Date.now()
): boolean {
  if (!lastAuthenticatedAtMs) return false;

  const elapsedMs = nowMs - lastAuthenticatedAtMs;

  switch (level) {
    case "TRUSTED":
      return elapsedMs < AUTH_TTL_MS; // 5 minutes
    case "SENSITIVE":
      return elapsedMs < 2 * 60 * 1000; // 2 minutes
    case "CRITICAL":
      return false; // Always require auth
    default:
      return false;
  }
}

/**
 * Get remaining session time based on auth level
 */
export function getSessionRemainingMsForLevel(
  lastAuthenticatedAtMs: number | null,
  level: AuthLevel,
  nowMs = Date.now()
): number {
  if (!lastAuthenticatedAtMs) return 0;

  const elapsedMs = nowMs - lastAuthenticatedAtMs;

  switch (level) {
    case "TRUSTED":
      return Math.max(0, AUTH_TTL_MS - elapsedMs);
    case "SENSITIVE":
      return Math.max(0, 2 * 60 * 1000 - elapsedMs);
    case "CRITICAL":
      return 0;
    default:
      return 0;
  }
}
