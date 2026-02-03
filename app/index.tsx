import { Link } from "expo-router";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { useAuthGate } from "@/features/auth/authGate";
import { todosCountAtom } from "@/features/todos/_atoms/todos";

export default function TodosScreen() {
  const todosCount = useAtomValue(todosCountAtom);
  const { ensureAuthenticated } = useAuthGate();

  const handleProtectedAdd = useCallback(async () => {
    const result = await ensureAuthenticated("Authenticate to add a todo");
    if (!result.ok && result.code !== "CANCELLED") {
      Alert.alert("Authentication", result.message);
      return;
    }
    if (result.ok) {
      Alert.alert(
        "Authenticated",
        "Todo creation flow will be added in Phase 2."
      );
    }
  }, [ensureAuthenticated]);

  return (
    <View className="flex-1 p-4 gap-3">
      <Text className="text-2xl font-bold">Todos ({todosCount})</Text>
      <Text className="opacity-80">
        Scaffold only. TODO list + local authentication will be implemented in
        later phases.
      </Text>

      <Link href="/settings" asChild>
        <Pressable className="bg-black px-4 py-3 rounded-xl self-start">
          <Text className="text-white font-semibold">Open settings</Text>
        </Pressable>
      </Link>

      <Pressable
        className="bg-blue-500 px-4 py-3 rounded-xl self-start active:opacity-80"
        onPress={handleProtectedAdd}
      >
        <Text className="text-white font-semibold">
          Protected add (placeholder)
        </Text>
      </Pressable>
    </View>
  );
}
