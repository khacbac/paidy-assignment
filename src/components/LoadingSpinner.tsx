import { ActivityIndicator, Text, View } from "react-native";

type LoadingSpinnerProps = {
  message?: string;
};

export function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <View className="items-center justify-center gap-2 py-6">
      <ActivityIndicator />
      <Text className="text-sm text-neutral-600 dark:text-neutral-300">{message}</Text>
    </View>
  );
}
