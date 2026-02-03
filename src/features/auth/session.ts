import { AUTH_TTL_MS } from "./constants";

export function isSessionValid(
  lastAuthenticatedAtMs: number | null,
  nowMs: number
): boolean {
  if (lastAuthenticatedAtMs == null) return false;
  return nowMs - lastAuthenticatedAtMs < AUTH_TTL_MS;
}
