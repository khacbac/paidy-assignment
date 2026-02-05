import { useRouter } from "expo-router";
import { useCallback } from "react";

import type { Todo } from "@/features/todos/types";

import { TodoItemDisplay } from "./TodoItemDisplay";

interface SwipeableTodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void | Promise<void>;
}

/**
 * Wrapper component that manages read mode and todo action navigation.
 */
export function SwipeableTodoItem({ todo, onToggle }: SwipeableTodoItemProps) {
  const router = useRouter();

  const handleToggle = useCallback(async () => {
    await onToggle(todo.id);
  }, [onToggle, todo.id]);

  const handleOpenActions = useCallback(() => {
    router.push({
      pathname: "/todo-actions",
      params: { id: todo.id },
    });
  }, [router, todo.id]);

  return (
    <TodoItemDisplay
      todo={todo}
      onToggle={handleToggle}
      onOpenActions={handleOpenActions}
    />
  );
}
