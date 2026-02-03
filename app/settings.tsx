import { useAtomValue } from "jotai/react";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { authStateAtom } from "@/features/auth/_atoms/auth";
import { useAuthGate } from "@/features/auth/authGate";
import {
  getLocalAuthAvailability,
  type LocalAuthAvailability,
} from "@/features/auth/localAuth";

function formatLastAuth(ms: number | null): string {
  if (ms == null) return "—";
  const d = new Date(ms);
  return d.toLocaleString();
}

export default function SettingsScreen() {
  const authState = useAtomValue(authStateAtom);
  const { ensureAuthenticated, lock } = useAuthGate();
  const [availability, setAvailability] =
    useState<LocalAuthAvailability | null>(null);

  useEffect(() => {
    getLocalAuthAvailability().then(setAvailability);
  }, []);

  const handleAuthenticate = useCallback(async () => {
    const result = await ensureAuthenticated("Authenticate to manage todos");
    if (!result.ok && result.code !== "CANCELLED") {
      Alert.alert("Authentication", result.message);
    }
  }, [ensureAuthenticated]);

  const handleLock = useCallback(() => {
    lock();
  }, [lock]);

  const localAuthAvailable = availability?.available === true;

  return (
    <View className="flex-1 p-4 gap-3">
      <Text className="text-2xl font-bold">Settings</Text>

      <View className="gap-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 p-4">
        <Text className="text-lg font-semibold">Auth status (Phase 1)</Text>
        <Text className="opacity-80">
          Status: <Text className="font-medium">{authState.status}</Text>
        </Text>
        <Text className="opacity-80">
          Last authenticated: {formatLastAuth(authState.lastAuthenticatedAtMs)}
        </Text>
      </View>

      {availability === null ? (
        <ActivityIndicator />
      ) : !localAuthAvailable ? (
        <View className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-4">
          <Text className="text-amber-800 dark:text-amber-200">
            {availability.available === false
              ? availability.message
              : "Device has no biometrics/PIN set up."}
          </Text>
          <Text className="mt-2 text-amber-700 dark:text-amber-300/90">
            Enable device lock or biometrics to use the auth gate.
          </Text>
        </View>
      ) : null}

      <View className="gap-2">
        <TouchableOpacity
          className="rounded-lg bg-blue-500 py-3 px-4 active:opacity-80"
          onPress={handleAuthenticate}
          disabled={!localAuthAvailable}
          style={!localAuthAvailable ? { opacity: 0.5 } : undefined}
        >
          <Text className="text-center font-medium text-white">
            Authenticate now
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded-lg border border-neutral-400 dark:border-neutral-500 py-3 px-4 active:opacity-80"
          onPress={handleLock}
        >
          <Text className="text-center font-medium text-neutral-800 dark:text-neutral-200">
            Lock now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
