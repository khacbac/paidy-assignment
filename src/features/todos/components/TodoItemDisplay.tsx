import { Pressable, Text, View } from "react-native";

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
  return (
    <Pressable
      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
      onPress={async () => {
        await HapticPatterns.LIGHT();
        onOpenActions();
      }}
      accessibilityLabel={`${todo.title} - ${todo.completed ? "Completed" : "Active"}`}
    >
      <View className="flex-row items-center gap-3 p-4">
        <Pressable
          onPress={async (event) => {
            event.stopPropagation();
            await HapticPatterns.LIGHT();
            onToggle();
          }}
          className="h-6 w-6 items-center justify-center"
          accessibilityLabel={todo.completed ? "Mark as active" : "Mark as completed"}
        >
          <View
            className={`h-6 w-6 items-center justify-center rounded-md border-2 ${
              todo.completed
                ? "border-green-500 bg-green-500"
                : "border-neutral-300 bg-transparent dark:border-neutral-600"
            }`}
          >
            {todo.completed && <Text className="text-xs font-bold text-white">✓</Text>}
          </View>
        </Pressable>

        <View className="flex-1">
          <Text
            className={`text-lg font-medium ${
              todo.completed
                ? "text-neutral-400 line-through"
                : "text-neutral-900 dark:text-neutral-100"
            }`}
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
