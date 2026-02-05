import { FlatList } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import type { Todo } from "@/features/todos/types";

import { SwipeableTodoItem } from "./SwipeableTodoItem";

type TodoListProps = {
  todos: Todo[];
  onToggle: (id: string) => void;
  emptyTitle: string;
  emptyDescription: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
};

export function TodoList({
  todos,
  onToggle,
  emptyTitle,
  emptyDescription,
  onEmptyAction,
  emptyActionLabel,
}: TodoListProps) {
  return (
    <FlatList
      data={todos}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ gap: 10, paddingBottom: 16, flexGrow: 1 }}
      ListEmptyComponent={
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onActionPress={onEmptyAction}
        />
      }
      renderItem={({ item }) => (
        <SwipeableTodoItem todo={item} onToggle={onToggle} />
      )}
    />
  );
}
