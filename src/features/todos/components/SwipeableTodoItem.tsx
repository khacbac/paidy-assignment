import { useState, useCallback, useEffect } from "react";
import { LayoutAnimation } from "react-native";

import type { Todo } from "@/features/todos/types";
import { HapticPatterns } from "@/utils/haptics";

import { TodoActionModal } from "./TodoActionModal";
import { TodoItemDisplay } from "./TodoItemDisplay";
import { TodoItemEdit } from "./TodoItemEdit";

interface SwipeableTodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void | Promise<void>;
  onSaveTitle: (todo: Todo) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onDuplicate: (id: string) => void | Promise<void>;
  shouldStartEditing?: boolean;
  onAutoEditHandled?: () => void;
}

/**
 * Wrapper component that manages read mode, action modal, and edit mode.
 */
export function SwipeableTodoItem({
  todo,
  onToggle,
  onSaveTitle,
  onDelete,
  onDuplicate,
  shouldStartEditing = false,
  onAutoEditHandled,
}: SwipeableTodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleEnterEdit = useCallback(() => {
    setIsActionModalVisible(false);
    LayoutAnimation.easeInEaseOut();
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(
    async (newTitle: string) => {
      setIsSaving(true);
      try {
        await onSaveTitle({ ...todo, title: newTitle });
        await HapticPatterns.SUCCESS();
        setIsEditing(false);
      } catch (error) {
        await HapticPatterns.ERROR();
        console.error("Failed to save todo:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [onSaveTitle, todo]
  );

  const handleCancelEdit = useCallback(async () => {
    await HapticPatterns.LIGHT();
    LayoutAnimation.easeInEaseOut();
    setIsEditing(false);
  }, []);

  const handleDelete = useCallback(async () => {
    setIsActionModalVisible(false);
    await onDelete(todo.id);
  }, [onDelete, todo.id]);

  const handleDuplicate = useCallback(async () => {
    setIsActionModalVisible(false);
    await onDuplicate(todo.id);
  }, [onDuplicate, todo.id]);

  useEffect(() => {
    if (!shouldStartEditing || isEditing) {
      return;
    }

    LayoutAnimation.easeInEaseOut();
    setIsEditing(true);
    onAutoEditHandled?.();
  }, [isEditing, onAutoEditHandled, shouldStartEditing]);

  return isEditing ? (
    <TodoItemEdit
      todo={todo}
      onSave={handleSave}
      onCancel={handleCancelEdit}
      onDelete={handleDelete}
      isSaving={isSaving}
    />
  ) : (
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
        onEdit={handleEnterEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />
    </>
  );
}
