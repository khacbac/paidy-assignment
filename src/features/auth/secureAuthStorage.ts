import { getSecureItem, removeSecureItem, setSecureItem } from "@/lib/storage";

import { AUTH_LAST_AT_KEY } from "./constants";

export async function getLastAuthenticatedAtMs(): Promise<number | null> {
  const raw = await getSecureItem(AUTH_LAST_AT_KEY);
  if (raw == null) return null;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;

  return parsed;
}

export async function setLastAuthenticatedAtMs(
  lastAuthenticatedAtMs: number
): Promise<void> {
  // Store as a stringified integer for portability.
  await setSecureItem(
    AUTH_LAST_AT_KEY,
    String(Math.floor(lastAuthenticatedAtMs))
  );
}

export async function clearLastAuthenticatedAtMs(): Promise<void> {
  await removeSecureItem(AUTH_LAST_AT_KEY);
}
