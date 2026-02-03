import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";

import type { Todo } from "@/features/todos/types";
import { HapticPatterns } from "@/utils/haptics";

interface TodoItemDisplayProps {
  todo: Todo;
  onToggle: () => void;
  onOpenActions: () => void;
}

/**
 * Display-only todo item in read mode.
 * Tapping the item opens action modal; checkbox toggles completion.
 */
export function TodoItemDisplay({
  todo,
  onToggle,
  onOpenActions,
}: TodoItemDisplayProps) {
  const isDark = useColorScheme() === "dark";

  return (
    <Pressable
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      onPress={async () => {
        await HapticPatterns.LIGHT();
        onOpenActions();
      }}
      accessibilityLabel={`${todo.title} - ${todo.completed ? "Completed" : "Active"}`}
    >
      <View style={styles.contentRow}>
        <Pressable
          onPress={async (event) => {
            event.stopPropagation();
            await HapticPatterns.LIGHT();
            onToggle();
          }}
          style={styles.checkboxTouchTarget}
          accessibilityLabel={todo.completed ? "Mark as active" : "Mark as completed"}
        >
          <View
            style={[
              styles.checkbox,
              todo.completed
                ? styles.checkboxCompleted
                : isDark
                  ? styles.checkboxDark
                  : styles.checkboxLight,
            ]}
          >
            {todo.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </Pressable>

        <View style={styles.titleWrapper}>
          <Text
            style={[
              styles.title,
              todo.completed
                ? styles.titleCompleted
                : isDark
                  ? styles.titleDark
                  : styles.titleLight,
            ]}
            numberOfLines={2}
            accessibilityLabel={`Open actions for ${todo.title}`}
          >
            {todo.title}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
  },
  containerLight: {
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },
  containerDark: {
    borderColor: "#404040",
    backgroundColor: "#171717",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  checkboxTouchTarget: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: {
    height: 24,
    width: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    borderWidth: 2,
  },
  checkboxLight: {
    borderColor: "#d4d4d4",
    backgroundColor: "transparent",
  },
  checkboxDark: {
    borderColor: "#525252",
    backgroundColor: "transparent",
  },
  checkboxCompleted: {
    borderColor: "#22c55e",
    backgroundColor: "#22c55e",
  },
  checkmark: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
  },
  titleLight: {
    color: "#171717",
  },
  titleDark: {
    color: "#f5f5f5",
  },
  titleCompleted: {
    color: "#a3a3a3",
    textDecorationLine: "line-through",
  },
});
