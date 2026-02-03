import { Text, View } from "react-native";

import { Button } from "@/components/Button";

type AuthPromptProps = {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
  isLoading?: boolean;
};

export function AuthPrompt({
  title,
  message,
  onConfirm,
  confirmLabel = "Authenticate",
  isLoading = false,
}: AuthPromptProps) {
  return (
    <View className="w-full max-w-sm gap-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
      <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{title}</Text>
      <Text className="text-sm text-neutral-600 dark:text-neutral-300">{message}</Text>
      <Button onPress={onConfirm} loading={isLoading} accessibilityLabel={confirmLabel}>
        {confirmLabel}
      </Button>
    </View>
  );
}
