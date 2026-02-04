import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { formatTimestamp } from "@/features/todos/formatTimestamp";
import type { Todo } from "@/features/todos/types";

type TodoItemProps = {
  todo: Todo;
  draftTitle: string;
  busy?: boolean;
  onChangeDraft: (value: string) => void;
  onToggle: () => void;
  onSaveTitle: () => void;
  onDelete: () => void;
};

export function TodoItem({
  todo,
  draftTitle,
  busy = false,
  onChangeDraft,
  onToggle,
  onSaveTitle,
  onDelete,
}: TodoItemProps) {
  const isDark = useColorScheme() === "dark";

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
      ]}
    >
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.title,
            todo.completed
              ? styles.titleCompleted
              : isDark
              ? styles.titleDark
              : styles.titleLight,
          ]}
          numberOfLines={1}
        >
          {todo.title}
        </Text>
        <Button
          variant={todo.completed ? "outline" : "secondary"}
          onPress={onToggle}
          disabled={busy}
          accessibilityLabel={
            todo.completed ? "Mark todo as active" : "Mark todo as completed"
          }
        >
          {todo.completed ? "Undo" : "Done"}
        </Button>
      </View>

      <Input
        label="Edit title"
        value={draftTitle}
        onChangeText={onChangeDraft}
        onSubmitEditing={onSaveTitle}
        accessibilityLabel={`Edit title for ${todo.title}`}
      />

      <View style={styles.actionRow}>
        <View style={styles.flexOne}>
          <Button
            variant="outline"
            onPress={onSaveTitle}
            disabled={busy || draftTitle.trim().length === 0}
            accessibilityLabel={`Save title for ${todo.title}`}
          >
            Save
          </Button>
        </View>
        <View style={styles.flexOne}>
          <Button
            variant="danger"
            onPress={onDelete}
            disabled={busy}
            accessibilityLabel={`Delete ${todo.title}`}
          >
            Delete
          </Button>
        </View>
      </View>

      <Text
        style={[
          styles.timestamp,
          isDark ? styles.timestampDark : styles.timestampLight,
        ]}
      >
        Created {formatTimestamp(todo.createdAtMs)}
      </Text>
      <Text
        style={[
          styles.timestamp,
          isDark ? styles.timestampDark : styles.timestampLight,
        ]}
      >
        Updated {formatTimestamp(todo.updatedAtMs)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  containerLight: {
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },
  containerDark: {
    borderColor: "#404040",
    backgroundColor: "#171717",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  titleLight: {
    color: "#171717",
  },
  titleDark: {
    color: "#f5f5f5",
  },
  titleCompleted: {
    color: "#737373",
    textDecorationLine: "line-through",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  flexOne: {
    flex: 1,
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
