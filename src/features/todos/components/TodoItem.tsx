import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
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

function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleString();
}

export function TodoItem({
  todo,
  draftTitle,
  busy = false,
  onChangeDraft,
  onToggle,
  onSaveTitle,
  onDelete,
}: TodoItemProps) {
  return (
    <View className="gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <View className="flex-row items-center justify-between gap-3">
        <Text
          className={`text-base font-semibold ${todo.completed ? "text-neutral-500 line-through" : "text-neutral-900 dark:text-neutral-100"}`}
          numberOfLines={1}
        >
          {todo.title}
        </Text>
        <Button
          variant={todo.completed ? "outline" : "secondary"}
          onPress={onToggle}
          disabled={busy}
          accessibilityLabel={todo.completed ? "Mark todo as active" : "Mark todo as completed"}
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

      <View className="flex-row gap-2">
        <View className="flex-1">
          <Button
            variant="outline"
            onPress={onSaveTitle}
            disabled={busy || draftTitle.trim().length === 0}
            accessibilityLabel={`Save title for ${todo.title}`}
          >
            Save
          </Button>
        </View>
        <View className="flex-1">
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

      <Text className="text-xs text-neutral-500 dark:text-neutral-400">
        Created {formatTimestamp(todo.createdAtMs)}
      </Text>
      <Text className="text-xs text-neutral-500 dark:text-neutral-400">
        Updated {formatTimestamp(todo.updatedAtMs)}
      </Text>
    </View>
  );
}
