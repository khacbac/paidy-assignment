import { Text, View } from "react-native";

export default function SettingsScreen() {
  return (
    <View className="flex-1 p-4 gap-3">
      <Text className="text-2xl font-bold">Settings</Text>
      <Text className="opacity-80">
        Scaffold only. Authentication controls will live here in later phases.
      </Text>
    </View>
  );
}
