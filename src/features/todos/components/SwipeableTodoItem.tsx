import { useCallback, useState } from "react";

import type { Todo } from "@/features/todos/types";

import { TodoActionModal } from "./TodoActionModal";
import { TodoItemDisplay } from "./TodoItemDisplay";

interface SwipeableTodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void | Promise<void>;
  onSaveTitle: (todo: Todo) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onDuplicate: (id: string) => void | Promise<void>;
}

/**
 * Wrapper component that manages read mode and action modal.
 */
export function SwipeableTodoItem({
  todo,
  onToggle,
  onSaveTitle,
  onDelete,
  onDuplicate,
}: SwipeableTodoItemProps) {
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);

  const handleToggle = useCallback(async () => {
    await onToggle(todo.id);
  }, [onToggle, todo.id]);

  const handleOpenActions = useCallback(() => {
    setIsActionModalVisible(true);
  }, []);

  const handleCloseActions = useCallback(() => {
    setIsActionModalVisible(false);
  }, []);

  const handleSave = useCallback(
    async (newTitle: string) => {
      await onSaveTitle({ ...todo, title: newTitle });
    },
    [onSaveTitle, todo]
  );

  const handleDelete = useCallback(async () => {
    setIsActionModalVisible(false);
    await onDelete(todo.id);
  }, [onDelete, todo.id]);

  const handleDuplicate = useCallback(async () => {
    setIsActionModalVisible(false);
    await onDuplicate(todo.id);
  }, [onDuplicate, todo.id]);

  return (
    <>
      <TodoItemDisplay
        todo={todo}
        onToggle={handleToggle}
        onOpenActions={handleOpenActions}
      />
      <TodoActionModal
        todo={todo}
        visible={isActionModalVisible}
        onClose={handleCloseActions}
        onSave={handleSave}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />
    </>
  );
}
