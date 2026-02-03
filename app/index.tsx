import { Link } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { AddTodoForm } from "@/features/todos/components/AddTodoForm";
import { TodoFilters } from "@/features/todos/components/TodoFilters";
import { TodoList } from "@/features/todos/components/TodoList";
import { AuthLevel } from "@/features/auth/types";
import { useAuthGate } from "@/features/auth/authGate";
import {
  activeTodosCountAtom,
  addTodoAtom,
  clearCompletedAtom,
  completedTodosCountAtom,
  deleteTodoAtom,
  duplicateTodoAtom,
  filteredTodosAtom,
  todosCountAtom,
  toggleTodoAtom,
  updateTodoAtom,
} from "@/features/todos/_atoms/todos";
import type { Todo, TodoFilter } from "@/features/todos/types";

function getEmptyState(filter: TodoFilter): {
  title: string;
  description: string;
} {
  if (filter === "active") {
    return {
      title: "No active todos",
      description: "Everything is complete. Nice work.",
    };
  }

  if (filter === "completed") {
    return {
      title: "No completed todos",
      description: "Complete a todo and it will show up here.",
    };
  }

  return {
    title: "No todos yet",
    description: "Add one task to get started.",
  };
}

export default function TodosScreen() {
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [newTitle, setNewTitle] = useState("");
  const [autoEditTodoId, setAutoEditTodoId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearingCompleted, setIsClearingCompleted] = useState(false);

  const visibleTodosAtom = useMemo(() => filteredTodosAtom(filter), [filter]);
  const visibleTodos = useAtomValue(visibleTodosAtom);
  const todosCount = useAtomValue(todosCountAtom);
  const activeTodosCount = useAtomValue(activeTodosCountAtom);
  const completedTodosCount = useAtomValue(completedTodosCountAtom);

  const addTodo = useSetAtom(addTodoAtom);
  const toggleTodo = useSetAtom(toggleTodoAtom);
  const updateTodo = useSetAtom(updateTodoAtom);
  const deleteTodo = useSetAtom(deleteTodoAtom);
  const duplicateTodo = useSetAtom(duplicateTodoAtom);
  const clearCompleted = useSetAtom(clearCompletedAtom);

  const { ensureAuthenticated } = useAuthGate();

  const runProtectedAction = useCallback(
    async <T,>(
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

  const handleAddTodo = useCallback(async () => {
    const nextTitle = newTitle.trim();
    if (nextTitle.length === 0) {
      setFormError("Please enter a todo title.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    try {
      const result = await runProtectedAction(
        "Authenticate to add a todo",
        AuthLevel.SENSITIVE,
        () => {
          addTodo(nextTitle);
        }
      );
      if (result !== null) {
        setNewTitle("");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [addTodo, newTitle, runProtectedAction]);

  const handleToggleTodo = useCallback(
    async (id: string) => {
      await runProtectedAction("Authenticate to update this todo", AuthLevel.TRUSTED, () => {
        toggleTodo(id);
      });
    },
    [runProtectedAction, toggleTodo]
  );

  const handleSaveTitle = useCallback(
    async (todo: Todo) => {
      await runProtectedAction("Authenticate to edit this todo", AuthLevel.TRUSTED, () => {
        updateTodo({ id: todo.id, title: todo.title });
      });
    },
    [runProtectedAction, updateTodo]
  );

  const handleDeleteTodo = useCallback(
    async (id: string) => {
      await runProtectedAction("Authenticate to delete this todo", AuthLevel.CRITICAL, () => {
        deleteTodo(id);
      });
    },
    [deleteTodo, runProtectedAction]
  );

  const handleDuplicateTodo = useCallback(
    async (id: string) => {
      const duplicatedId = await runProtectedAction(
        "Authenticate to duplicate this todo",
        AuthLevel.TRUSTED,
        () => duplicateTodo(id)
      );
      if (duplicatedId) {
        setAutoEditTodoId(duplicatedId);
      }
    },
    [duplicateTodo, runProtectedAction]
  );

  const handleClearCompleted = useCallback(async () => {
    setIsClearingCompleted(true);
    try {
      await runProtectedAction("Authenticate to clear completed todos", AuthLevel.CRITICAL, () => {
        clearCompleted();
      });
    } finally {
      setIsClearingCompleted(false);
    }
  }, [clearCompleted, runProtectedAction]);

  const emptyState = getEmptyState(filter);

  return (
    <View className="flex-1 bg-neutral-100 px-4 pb-4 pt-5 dark:bg-neutral-950">
      <View className="gap-4">
        <View>
          <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Todos
          </Text>
          <Text className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
            Protected actions require local authentication.
          </Text>
        </View>

        <AddTodoForm
          value={newTitle}
          onChangeText={(value) => {
            setNewTitle(value);
            if (formError) {
              setFormError(null);
            }
          }}
          onSubmit={() => {
            void handleAddTodo();
          }}
          onClear={() => {
            setNewTitle("");
            setFormError(null);
          }}
          isSubmitting={isSubmitting}
          errorMessage={formError}
        />

        {actionError ? (
          <Text className="text-sm text-red-600 dark:text-red-400">{actionError}</Text>
        ) : null}

        <TodoFilters
          selectedFilter={filter}
          totalCount={todosCount}
          activeCount={activeTodosCount}
          completedCount={completedTodosCount}
          onChangeFilter={setFilter}
        />

        <View className="flex-row gap-2">
          <View className="flex-1">
            <Button
              variant="outline"
              onPress={() => {
                void handleClearCompleted();
              }}
              loading={isClearingCompleted}
              disabled={completedTodosCount === 0}
              accessibilityLabel="Clear completed todos"
            >
              Clear Completed
            </Button>
          </View>

          <View className="flex-1">
            <Link href="/settings" asChild>
              <Button variant="secondary" accessibilityLabel="Open settings screen">
                Settings
              </Button>
            </Link>
          </View>
        </View>
      </View>

      <View className="mt-4 flex-1">
        <TodoList
          todos={visibleTodos}
          onToggle={(id) => {
            void handleToggleTodo(id);
          }}
          onSaveTitle={(todo) => {
            void handleSaveTitle(todo);
          }}
          onDelete={(id) => {
            void handleDeleteTodo(id);
          }}
          onDuplicate={(id) => {
            void handleDuplicateTodo(id);
          }}
          autoEditTodoId={autoEditTodoId}
          onAutoEditHandled={() => {
            setAutoEditTodoId(null);
          }}
          emptyTitle={emptyState.title}
          emptyDescription={emptyState.description}
          emptyActionLabel={filter === "all" ? undefined : "Show all todos"}
          onEmptyAction={
            filter === "all"
              ? undefined
              : () => {
                  setFilter("all");
                }
          }
        />
      </View>
    </View>
  );
}
