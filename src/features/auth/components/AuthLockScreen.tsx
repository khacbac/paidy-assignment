import { useState } from "react";
import { Alert, StyleSheet, View, useColorScheme } from "react-native";

import { useAuthGate } from "../authGate";

import { AuthPrompt } from "./AuthPrompt";

export function AuthLockScreen() {
  const { ensureAuthenticated } = useAuthGate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const isDark = useColorScheme() === "dark";

  const handleUnlock = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      const result = await ensureAuthenticated("Unlock to access your todos");
      if (!result.ok && result.code !== "CANCELLED") {
        Alert.alert("Authentication", result.message);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <AuthPrompt
        title="App Locked"
        message="Authenticate to continue to your todos and settings."
        onConfirm={handleUnlock}
        confirmLabel="Unlock"
        isLoading={isAuthenticating}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  containerLight: {
    backgroundColor: "#f5f5f5",
  },
  containerDark: {
    backgroundColor: "#0a0a0a",
  },
});
