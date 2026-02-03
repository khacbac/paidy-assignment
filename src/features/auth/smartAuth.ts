import { useCallback } from "react";
import { AuthLevel } from "./types";
import { AUTH_TTL_MS } from "./constants";

/**
 * Sensitive operations TTL (2 minutes)
 */
export const SENSITIVE_TTL_MS = 2 * 60 * 1000;

/**
 * Configuration for different authentication levels
 */
export const AUTH_LEVEL_CONFIG = {
  [AuthLevel.TRUSTED]: {
    ttlMs: AUTH_TTL_MS, // 5 minutes
    description: "Low-risk actions like toggling todos",
  },
  [AuthLevel.SENSITIVE]: {
    ttlMs: SENSITIVE_TTL_MS, // 2 minutes
    description: "Medium-risk actions like adding todos",
  },
  [AuthLevel.CRITICAL]: {
    ttlMs: 0, // Always require authentication
    description: "High-risk actions like deleting todos",
  },
} as const;

export interface SmartAuthResult {
  requiresAuth: boolean;
  remainingMs: number;
  level: AuthLevel;
}

/**
 * Calculate if authentication is required based on auth level and time elapsed
 */
export function calculateAuthRequirement(
  lastAuthAt: number | undefined,
  level: AuthLevel
): SmartAuthResult {
  const now = Date.now();
  const config = AUTH_LEVEL_CONFIG[level];

  if (!lastAuthAt) {
    return {
      requiresAuth: true,
      remainingMs: 0,
      level,
    };
  }

  const elapsedMs = now - lastAuthAt;
  const remainingMs = Math.max(0, config.ttlMs - elapsedMs);

  return {
    requiresAuth: elapsedMs > config.ttlMs,
    remainingMs,
    level,
  };
}

/**
 * Get the remaining authentication time in milliseconds for a given level
 */
export function getRemainingAuthTime(lastAuthAt: number | undefined, level: AuthLevel): number {
  if (!lastAuthAt) return 0;

  const config = AUTH_LEVEL_CONFIG[level];
  const now = Date.now();
  const elapsedMs = now - lastAuthAt;

  return Math.max(0, config.ttlMs - elapsedMs);
}

/**
 * Format remaining time as a human-readable string
 */
export function formatRemainingTime(ms: number): string {
  if (ms <= 0) return "Expired";

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

/**
 * Hook to check authentication requirements
 */
export function useSmartAuth() {
  const checkAuth = useCallback((lastAuthAt: number | undefined, level: AuthLevel): SmartAuthResult => {
    return calculateAuthRequirement(lastAuthAt, level);
  }, []);

  return { checkAuth, getRemainingAuthTime, formatRemainingTime };
}
