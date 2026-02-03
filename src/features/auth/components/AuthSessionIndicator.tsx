import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";

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
    // Update immediately when auth state changes
    setRemainingMs(getSessionRemainingMsForLevel(authState.lastAuthenticatedAtMs, level));

    // Update every second while session is valid
    if (authState.lastAuthenticatedAtMs) {
      const interval = setInterval(() => {
        const timeLeft = getSessionRemainingMsForLevel(authState.lastAuthenticatedAtMs, level);
        setRemainingMs(timeLeft);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [authState.lastAuthenticatedAtMs, level]);

  // Only show when session is active
  if (!authState.lastAuthenticatedAtMs || remainingMs <= 0) {
    return null;
  }

  // Color based on remaining time
  const isLow = remainingMs < 30000; // Less than 30 seconds
  const colorClass = isLow ? "text-red-500" : "text-green-500";

  return (
    <View className="flex-row items-center">
      <View className={`h-2 w-2 rounded-full ${isLow ? "bg-red-500" : "bg-green-500"} mr-2`} />
      <Text className={`text-xs ${colorClass}`}>{formatRemainingTime(remainingMs)}</Text>
    </View>
  );
}
