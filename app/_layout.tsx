import { Stack } from "expo-router";
import "../global.css";

import { useAuthInit } from "@/features/auth/useAppStateLock";
import { AppProviders } from "@/lib/providers/app-providers";

function AuthInit() {
  useAuthInit();
  return null;
}

export default function RootLayout() {
  return (
    <AppProviders>
      <AuthInit />
      <Stack>
        <Stack.Screen name="index" options={{ title: "Todos" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
      </Stack>
    </AppProviders>
  );
}
