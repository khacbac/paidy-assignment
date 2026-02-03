import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

import { useAuthGate } from "../authGate";

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
    <View className="flex-1 items-center justify-center p-6 gap-4">
      <Text className="text-2xl font-bold text-center">App Locked</Text>
      <Text className="text-center opacity-80">
        Authenticate to continue to your todos and settings.
      </Text>

      <Pressable
        onPress={handleUnlock}
        disabled={isAuthenticating}
        className="rounded-lg bg-blue-500 px-5 py-3 active:opacity-80"
        style={isAuthenticating ? { opacity: 0.7 } : undefined}
      >
        {isAuthenticating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="font-semibold text-white">Unlock</Text>
        )}
      </Pressable>
    </View>
  );
}
