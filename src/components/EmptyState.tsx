import { Text, View } from "react-native";

import { Button } from "./Button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onActionPress,
}: EmptyStateProps) {
  return (
    <View className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5 dark:border-neutral-600 dark:bg-neutral-900/50">
      <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</Text>
      <Text className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{description}</Text>
      {actionLabel && onActionPress ? (
        <View className="mt-4 self-start">
          <Button variant="outline" onPress={onActionPress}>
            {actionLabel}
          </Button>
        </View>
      ) : null}
    </View>
  );
}
