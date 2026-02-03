import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { authStateAtom } from "@/features/auth/_atoms/auth";
import { useAuthGate } from "@/features/auth/authGate";
import {
  getLocalAuthAvailability,
  type LocalAuthAvailability,
} from "@/features/auth/localAuth";
import { getSessionRemainingMs } from "@/features/auth/session";
import { todosAtom } from "@/features/todos/_atoms/todos";

function formatLastAuth(ms: number | null): string {
  if (ms == null) return "Never";
  return new Date(ms).toLocaleString();
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Expired";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function SettingsScreen() {
  const authState = useAtomValue(authStateAtom);
  const setTodos = useSetAtom(todosAtom);
  const { ensureAuthenticated, lock } = useAuthGate();

  const [availability, setAvailability] =
    useState<LocalAuthAvailability | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    let mounted = true;
    getLocalAuthAvailability().then((next) => {
      if (mounted) {
        setAvailability(next);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const sessionRemainingMs = useMemo(
    () => getSessionRemainingMs(authState.lastAuthenticatedAtMs, nowMs),
    [authState.lastAuthenticatedAtMs, nowMs]
  );

  const localAuthAvailable = availability?.available === true;

  const handleAuthenticate = useCallback(async () => {
    setActionError(null);
    setIsAuthenticating(true);
    try {
      const result = await ensureAuthenticated("Authenticate to manage todos");
      if (!result.ok && result.code !== "CANCELLED") {
        setActionError(result.message);
      }
    } finally {
      setIsAuthenticating(false);
    }
  }, [ensureAuthenticated]);

  const handleClearAllData = useCallback(async () => {
    setActionError(null);
    setIsClearingData(true);
    try {
      const result = await ensureAuthenticated(
        "Authenticate to clear all local todo data"
      );
      if (!result.ok) {
        if (result.code !== "CANCELLED") {
          setActionError(result.message);
        }
        return;
      }

      setTodos([]);
      lock();
      Alert.alert("Data cleared", "All todos were removed and the app was locked.");
    } finally {
      setIsClearingData(false);
    }
  }, [ensureAuthenticated, lock, setTodos]);

  return (
    <View className="flex-1 gap-4 bg-neutral-100 px-4 pb-4 pt-5 dark:bg-neutral-950">
      <View>
        <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Settings
        </Text>
        <Text className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
          Authentication controls and session diagnostics.
        </Text>
      </View>

      <View className="gap-2 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Session Information
        </Text>
        <Text className="text-sm text-neutral-700 dark:text-neutral-200">
          Status: {authState.status}
        </Text>
        <Text className="text-sm text-neutral-700 dark:text-neutral-200">
          Last authenticated: {formatLastAuth(authState.lastAuthenticatedAtMs)}
        </Text>
        <Text className="text-sm text-neutral-700 dark:text-neutral-200">
          Time until expiry: {formatRemaining(sessionRemainingMs)}
        </Text>
      </View>

      {availability === null ? (
        <LoadingSpinner message="Checking local authentication availability..." />
      ) : !localAuthAvailable ? (
        <EmptyState
          title="Local auth unavailable"
          description={
            availability.available === false
              ? availability.message
              : "Enable biometrics or passcode to secure this app."
          }
        />
      ) : null}

      <View className="gap-2">
        <Button
          onPress={() => {
            void handleAuthenticate();
          }}
          loading={isAuthenticating}
          disabled={!localAuthAvailable}
          accessibilityLabel="Authenticate now"
        >
          Authenticate Now
        </Button>

        <Button
          variant="outline"
          onPress={lock}
          accessibilityLabel="Lock application now"
        >
          Lock Now
        </Button>

        <Button
          variant="danger"
          onPress={() => {
            Alert.alert(
              "Clear all data",
              "This permanently removes all todos on this device. Continue?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Clear",
                  style: "destructive",
                  onPress: () => {
                    void handleClearAllData();
                  },
                },
              ]
            );
          }}
          loading={isClearingData}
          accessibilityLabel="Clear all todo data"
          accessibilityHint="Deletes all local todo items after authentication"
        >
          Clear All Data
        </Button>
      </View>

      {actionError ? (
        <Text className="text-sm text-red-600 dark:text-red-400">{actionError}</Text>
      ) : null}
    </View>
  );
}
