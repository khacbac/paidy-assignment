import { StyleSheet, View } from "react-native";

import { TODO_PRIORITY_CONFIG } from "@/features/todos/constants";
import type { TodoPriority } from "@/features/todos/types";

type PriorityDotProps = {
  priority: TodoPriority | undefined;
  size?: "small" | "medium";
};

const SIZE_BY_VARIANT = {
  small: 8,
  medium: 10,
} as const;

export function PriorityDot({ priority, size = "medium" }: PriorityDotProps) {
  const nextPriority = priority ?? "none";
  if (nextPriority === "none") {
    return null;
  }

  const dotSize = SIZE_BY_VARIANT[size];
  return (
    <View
      style={[
        styles.dot,
        {
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: TODO_PRIORITY_CONFIG[nextPriority].color,
        },
      ]}
      accessibilityLabel={`${TODO_PRIORITY_CONFIG[nextPriority].label} priority`}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
});
