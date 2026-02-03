import { FlatList, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import type { Todo } from "@/features/todos/types";

import { TodoItem } from "./TodoItem";

type TodoListProps = {
  todos: Todo[];
  busyTodoId: string | null;
  titleDrafts: Record<string, string>;
  onChangeDraft: (id: string, value: string) => void;
  onToggle: (id: string) => void;
  onSaveTitle: (todo: Todo) => void;
  onDelete: (id: string) => void;
  emptyTitle: string;
  emptyDescription: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
};

export function TodoList({
  todos,
  busyTodoId,
  titleDrafts,
  onChangeDraft,
  onToggle,
  onSaveTitle,
  onDelete,
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
        <TodoItem
          todo={item}
          draftTitle={titleDrafts[item.id] ?? item.title}
          busy={busyTodoId === item.id}
          onChangeDraft={(value) => onChangeDraft(item.id, value)}
          onToggle={() => onToggle(item.id)}
          onSaveTitle={() => onSaveTitle(item)}
          onDelete={() => onDelete(item.id)}
        />
      )}
      ItemSeparatorComponent={() => <View className="h-0" />}
    />
  );
}
