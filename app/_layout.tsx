import { Stack } from "expo-router";
import { useAtomValue } from "jotai";
import { ActivityIndicator, Text, View } from "react-native";
import "../global.css";

import { authHydratedAtom, authStateAtom } from "@/features/auth/_atoms/auth";
import { AuthLockScreen } from "@/features/auth/components/AuthLockScreen";
import { useAuthInit } from "@/features/auth/useAppStateLock";
import { AppProviders } from "@/lib/providers/app-providers";

function AuthInit() {
  useAuthInit();
  return null;
}

function AppContent() {
  const authState = useAtomValue(authStateAtom);
  const isAuthHydrated = useAtomValue(authHydratedAtom);

  if (!isAuthHydrated) {
    return (
      <View className="flex-1 items-center justify-center gap-3">
        <ActivityIndicator />
        <Text className="opacity-70">Loading secure session...</Text>
      </View>
    );
  }

  if (authState.status !== "unlocked") {
    return <AuthLockScreen />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Todos" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <AuthInit />
      <AppContent />
    </AppProviders>
  );
}
