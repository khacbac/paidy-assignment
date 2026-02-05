import { useAuthGate } from "@/features/auth/authGate";
import { AuthLevel } from "@/features/auth/types";
import {
  clearCompletedAtom,
  deleteTodoAtom,
  duplicateTodoAtom,
  toggleTodoAtom,
  updateTodoAtom,
} from "@/features/todos/_atoms/todos";
import type { Todo } from "@/features/todos/types";
import { useSetAtom } from "jotai";
import { useCallback, useState } from "react";

export function useProtectedTodoActions() {
  const [actionError, setActionError] = useState<string | null>(null);
  const [isClearingCompleted, setIsClearingCompleted] = useState(false);

  const toggleTodo = useSetAtom(toggleTodoAtom);
  const updateTodo = useSetAtom(updateTodoAtom);
  const deleteTodo = useSetAtom(deleteTodoAtom);
  const duplicateTodo = useSetAtom(duplicateTodoAtom);
  const clearCompleted = useSetAtom(clearCompletedAtom);
  const { ensureAuthenticated } = useAuthGate();

  const runProtectedAction = useCallback(
    async <T>(
      reason: string,
      level: AuthLevel,
      action: () => T | Promise<T>
    ): Promise<T | null> => {
      setActionError(null);
      const result = await ensureAuthenticated(reason, level);
      if (!result.ok) {
        if (result.code !== "CANCELLED") {
          setActionError(result.message);
        }
        return null;
      }

      return action();
    },
    [ensureAuthenticated]
  );

  const handleToggleTodo = useCallback(
    async (id: string) => {
      await runProtectedAction(
        "Authenticate to update this todo",
        AuthLevel.TRUSTED,
        () => {
          toggleTodo(id);
        }
      );
    },
    [runProtectedAction, toggleTodo]
  );

  const handleSaveTitle = useCallback(
    async (todo: Todo) => {
      await runProtectedAction(
        "Authenticate to edit this todo",
        AuthLevel.TRUSTED,
        () => {
          updateTodo({
            id: todo.id,
            title: todo.title,
            description: todo.description,
          });
        }
      );
    },
    [runProtectedAction, updateTodo]
  );

  const handleDeleteTodo = useCallback(
    async (id: string) => {
      await runProtectedAction(
        "Authenticate to delete this todo",
        AuthLevel.CRITICAL,
        () => {
          deleteTodo(id);
        }
      );
    },
    [deleteTodo, runProtectedAction]
  );

  const handleDuplicateTodo = useCallback(
    async (id: string) => {
      await runProtectedAction(
        "Authenticate to duplicate this todo",
        AuthLevel.TRUSTED,
        () => duplicateTodo(id)
      );
    },
    [duplicateTodo, runProtectedAction]
  );

  const handleClearCompleted = useCallback(async () => {
    setIsClearingCompleted(true);
    try {
      await runProtectedAction(
        "Authenticate to clear completed todos",
        AuthLevel.CRITICAL,
        () => {
          clearCompleted();
        }
      );
    } finally {
      setIsClearingCompleted(false);
    }
  }, [clearCompleted, runProtectedAction]);

  return {
    actionError,
    isClearingCompleted,
    runProtectedAction,
    handleToggleTodo,
    handleSaveTitle,
    handleDeleteTodo,
    handleDuplicateTodo,
    handleClearCompleted,
  };
}
