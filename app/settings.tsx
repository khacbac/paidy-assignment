import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View, useColorScheme } from "react-native";

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
  const isDark = useColorScheme() === "dark";

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
    <View style={[styles.screen, isDark ? styles.screenDark : styles.screenLight]}>
      <View>
        <Text style={[styles.heading, isDark ? styles.headingDark : styles.headingLight]}>
          Settings
        </Text>
        <Text style={[styles.subheading, isDark ? styles.subheadingDark : styles.subheadingLight]}>
          Authentication controls and session diagnostics.
        </Text>
      </View>

      <View style={[styles.sessionCard, isDark ? styles.sessionCardDark : styles.sessionCardLight]}>
        <Text style={[styles.sessionTitle, isDark ? styles.sessionTitleDark : styles.sessionTitleLight]}>
          Session Information
        </Text>
        <Text style={[styles.sessionLine, isDark ? styles.sessionLineDark : styles.sessionLineLight]}>
          Status: {authState.status}
        </Text>
        <Text style={[styles.sessionLine, isDark ? styles.sessionLineDark : styles.sessionLineLight]}>
          Last authenticated: {formatLastAuth(authState.lastAuthenticatedAtMs)}
        </Text>
        <Text style={[styles.sessionLine, isDark ? styles.sessionLineDark : styles.sessionLineLight]}>
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

      <View style={styles.actionsColumn}>
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
        <Text style={[styles.errorText, isDark ? styles.errorTextDark : styles.errorTextLight]}>
          {actionError}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 16,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  screenLight: {
    backgroundColor: "#f5f5f5",
  },
  screenDark: {
    backgroundColor: "#0a0a0a",
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
  },
  headingLight: {
    color: "#171717",
  },
  headingDark: {
    color: "#f5f5f5",
  },
  subheading: {
    marginTop: 4,
    fontSize: 14,
  },
  subheadingLight: {
    color: "#525252",
  },
  subheadingDark: {
    color: "#d4d4d4",
  },
  sessionCard: {
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  sessionCardLight: {
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },
  sessionCardDark: {
    borderColor: "#404040",
    backgroundColor: "#171717",
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  sessionTitleLight: {
    color: "#171717",
  },
  sessionTitleDark: {
    color: "#f5f5f5",
  },
  sessionLine: {
    fontSize: 14,
  },
  sessionLineLight: {
    color: "#404040",
  },
  sessionLineDark: {
    color: "#e5e5e5",
  },
  actionsColumn: {
    gap: 8,
  },
  errorText: {
    fontSize: 14,
  },
  errorTextLight: {
    color: "#dc2626",
  },
  errorTextDark: {
    color: "#f87171",
  },
});
