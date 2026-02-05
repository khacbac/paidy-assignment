import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
  const isDark = useColorScheme() === "dark";
  const router = useRouter();

  if (!isAuthHydrated) {
    return (
      <View
        style={[
          styles.loadingContainer,
          isDark ? styles.loadingContainerDark : styles.loadingContainerLight,
        ]}
      >
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
          backgroundColor: isDark ? "#171717" : "#f5f5f5",
        },
        headerTintColor: isDark ? "#f5f5f5" : "#171717",
        headerTitleStyle: {
          fontWeight: "700",
        },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Todo List",
          headerRight: () => (
            <Pressable
              onPress={() => {
                router.push("/settings");
              }}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              hitSlop={8}
              style={styles.settingsButton}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={isDark ? "#f5f5f5" : "#171717"}
              />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
      <Stack.Screen
        name="todo-actions"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <AuthInit />
        <AppContent />
      </AppProviders>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingContainerLight: {
    backgroundColor: "#f5f5f5",
  },
  loadingContainerDark: {
    backgroundColor: "#0a0a0a",
  },
  settingsButton: {
    padding: 4,
  },
});
