import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";

import { authStateAtom } from "@/features/auth/_atoms/auth";
import { getSessionRemainingMsForLevel } from "@/features/auth/session";
import { AuthLevel } from "@/features/auth/types";
import { formatRemainingTime } from "@/features/auth/smartAuth";

interface AuthSessionIndicatorProps {
  level?: AuthLevel;
}

/**
 * Visual indicator showing remaining authentication time
 * Updates every second to show countdown
 */
export function AuthSessionIndicator({ level = AuthLevel.TRUSTED }: AuthSessionIndicatorProps) {
  const authState = useAtomValue(authStateAtom);
  const [remainingMs, setRemainingMs] = useState(() =>
    getSessionRemainingMsForLevel(authState.lastAuthenticatedAtMs, level)
  );

  useEffect(() => {
    setRemainingMs(getSessionRemainingMsForLevel(authState.lastAuthenticatedAtMs, level));

    if (authState.lastAuthenticatedAtMs) {
      const interval = setInterval(() => {
        const timeLeft = getSessionRemainingMsForLevel(authState.lastAuthenticatedAtMs, level);
        setRemainingMs(timeLeft);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [authState.lastAuthenticatedAtMs, level]);

  if (!authState.lastAuthenticatedAtMs || remainingMs <= 0) {
    return null;
  }

  const isLow = remainingMs < 30000;

  return (
    <View style={styles.container}>
      <View style={[styles.dot, isLow ? styles.dotLow : styles.dotHealthy]} />
      <Text style={[styles.text, isLow ? styles.textLow : styles.textHealthy]}>
        {formatRemainingTime(remainingMs)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  dotLow: {
    backgroundColor: "#ef4444",
  },
  dotHealthy: {
    backgroundColor: "#22c55e",
  },
  text: {
    fontSize: 12,
  },
  textLow: {
    color: "#ef4444",
  },
  textHealthy: {
    color: "#22c55e",
  },
});
