import { Link } from "expo-router";
import { useAtomValue } from "jotai";
import { Pressable, Text, View } from "react-native";

import { todosCountAtom } from "@/features/todos/_atoms/todos";

export default function TodosScreen() {
  const todosCount = useAtomValue(todosCountAtom);

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
    </View>
  );
}
