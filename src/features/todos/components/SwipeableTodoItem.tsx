import { useState, useCallback } from "react";
import { LayoutAnimation } from "react-native";

import type { Todo } from "@/features/todos/types";
import { HapticPatterns } from "@/utils/haptics";
import { TodoItemDisplay } from "./TodoItemDisplay";
import { TodoItemEdit } from "./TodoItemEdit";

interface SwipeableTodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void | Promise<void>;
  onSaveTitle: (id: string, newTitle: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
}

/**
 * Wrapper component that manages the state between display and edit modes
 * Handles all interactions including swipe gestures, taps, and save/delete actions
 */
export function SwipeableTodoItem({
  todo,
  onToggle,
  onSaveTitle,
  onDelete,
}: SwipeableTodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = useCallback(async () => {
    await HapticPatterns.LIGHT();
    await onToggle(todo.id);
  }, [onToggle, todo.id]);

  const handleEnterEdit = useCallback(async () => {
    await HapticPatterns.MEDIUM();
    LayoutAnimation.easeInEaseOut();
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(
    async (newTitle: string) => {
      setIsSaving(true);
      try {
        await onSaveTitle(todo.id, newTitle);
        await HapticPatterns.SUCCESS();
        setIsEditing(false);
      } catch (error) {
        await HapticPatterns.ERROR();
        console.error("Failed to save todo:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [onSaveTitle, todo.id]
  );

  const handleCancelEdit = useCallback(async () => {
    await HapticPatterns.LIGHT();
    LayoutAnimation.easeInEaseOut();
    setIsEditing(false);
  }, []);

  const handleDelete = useCallback(async () => {
    await HapticPatterns.HEAVY();
    await onDelete(todo.id);
  }, [onDelete, todo.id]);

  return isEditing ? (
    <TodoItemEdit
      todo={todo}
      onSave={handleSave}
      onCancel={handleCancelEdit}
      onDelete={handleDelete}
      isSaving={isSaving}
    />
  ) : (
    <TodoItemDisplay
      todo={todo}
      onToggle={handleToggle}
      onDelete={handleDelete}
      onEnterEdit={handleEnterEdit}
    />
  );
}
