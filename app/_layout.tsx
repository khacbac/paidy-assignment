import { Stack } from "expo-router";
import { useAtomValue } from "jotai";
import { View } from "react-native";
import "../global.css";

import { LoadingSpinner } from "@/components/LoadingSpinner";
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
      <View className="flex-1 items-center justify-center bg-neutral-100 px-6 dark:bg-neutral-950">
        <LoadingSpinner message="Loading secure session..." />
      </View>
    );
  }

  if (authState.status !== "unlocked") {
    return <AuthLockScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#f5f5f5",
        },
        headerTitleStyle: {
          fontWeight: "700",
        },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Todo List" }} />
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
