import { useState } from "react";
import { Alert, View } from "react-native";

import { useAuthGate } from "../authGate";

import { AuthPrompt } from "./AuthPrompt";

export function AuthLockScreen() {
  const { ensureAuthenticated } = useAuthGate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

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
    <View className="flex-1 items-center justify-center bg-neutral-100 p-6 dark:bg-neutral-950">
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
