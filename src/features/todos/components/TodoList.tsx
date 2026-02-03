import { FlatList } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import type { Todo } from "@/features/todos/types";

import { SwipeableTodoItem } from "./SwipeableTodoItem";

type TodoListProps = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onSaveTitle: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  autoEditTodoId?: string | null;
  onAutoEditHandled?: () => void;
  emptyTitle: string;
  emptyDescription: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
};

export function TodoList({
  todos,
  onToggle,
  onSaveTitle,
  onDelete,
  onDuplicate,
  autoEditTodoId,
  onAutoEditHandled,
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
        <SwipeableTodoItem
          todo={item}
          onToggle={onToggle}
          onSaveTitle={onSaveTitle}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          shouldStartEditing={autoEditTodoId === item.id}
          onAutoEditHandled={onAutoEditHandled}
        />
      )}
    />
  );
}
