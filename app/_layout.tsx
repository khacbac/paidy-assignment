import { Stack } from "expo-router";

import { AppProviders } from "@/lib/providers/app-providers";

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Todos" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
      </Stack>
    </AppProviders>
  );
}
