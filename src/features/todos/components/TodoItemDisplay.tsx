import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { formatTimestamp } from "@/features/todos/formatTimestamp";
import {
  getTodoCategoryEmoji,
  TODO_CARD_SHADOW_STYLES,
} from "@/features/todos/constants";
import type { Todo } from "@/features/todos/types";
import { HapticPatterns } from "@/utils/haptics";

import { PriorityDot } from "./PriorityDot";

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
  const categoryEmoji = getTodoCategoryEmoji(todo.category);

  return (
    <Pressable
      style={[
        styles.container,
        isDark ? TODO_CARD_SHADOW_STYLES.dark : TODO_CARD_SHADOW_STYLES.light,
        isDark ? styles.containerDark : styles.containerLight,
      ]}
      onPress={async () => {
        await HapticPatterns.LIGHT();
        onOpenActions();
      }}
      accessibilityLabel={`${todo.title} - ${
        todo.completed ? "Completed" : "Active"
      }`}
    >
      <View style={styles.contentRow}>
        <Pressable
          onPress={async (event) => {
            event.stopPropagation();
            await HapticPatterns.LIGHT();
            onToggle();
          }}
          style={styles.checkboxTouchTarget}
          accessibilityLabel={
            todo.completed ? "Mark as active" : "Mark as completed"
          }
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
          <View style={styles.titleRow}>
            <PriorityDot priority={todo.priority} />
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
              {`${categoryEmoji ? `${categoryEmoji} ` : ""}${todo.title}`}
            </Text>
          </View>
          {todo.description ? (
            <Text
              style={[
                styles.description,
                isDark ? styles.descriptionDark : styles.descriptionLight,
              ]}
              numberOfLines={2}
            >
              {todo.description}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            <View
              style={[
                styles.statusBadge,
                todo.completed
                  ? styles.statusBadgeCompleted
                  : isDark
                  ? styles.statusBadgeDark
                  : styles.statusBadgeLight,
              ]}
            >
              <Text
                style={[
                  styles.statusLabel,
                  todo.completed
                    ? styles.statusLabelCompleted
                    : isDark
                    ? styles.statusLabelDark
                    : styles.statusLabelLight,
                ]}
              >
                {todo.completed ? "Completed" : "Active"}
              </Text>
            </View>
            <Text
              style={[
                styles.timestamp,
                isDark ? styles.timestampDark : styles.timestampLight,
              ]}
            >
              Updated {formatTimestamp(todo.updatedAtMs)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
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
    alignItems: "flex-start",
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
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    flex: 1,
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
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  descriptionLight: {
    color: "#404040",
  },
  descriptionDark: {
    color: "#d4d4d4",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeLight: {
    borderColor: "#d4d4d4",
    backgroundColor: "#fafafa",
  },
  statusBadgeDark: {
    borderColor: "#525252",
    backgroundColor: "#262626",
  },
  statusBadgeCompleted: {
    borderColor: "#16a34a",
    backgroundColor: "#dcfce7",
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statusLabelLight: {
    color: "#404040",
  },
  statusLabelDark: {
    color: "#d4d4d4",
  },
  statusLabelCompleted: {
    color: "#166534",
  },
  timestamp: {
    fontSize: 12,
  },
  timestampLight: {
    color: "#737373",
  },
  timestampDark: {
    color: "#a3a3a3",
  },
});
