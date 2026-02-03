import { Link } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { AddTodoForm } from "@/features/todos/components/AddTodoForm";
import { TodoFilters } from "@/features/todos/components/TodoFilters";
import { TodoList } from "@/features/todos/components/TodoList";
import { useAuthGate } from "@/features/auth/authGate";
import {
  activeTodosCountAtom,
  addTodoAtom,
  clearCompletedAtom,
  completedTodosCountAtom,
  deleteTodoAtom,
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
  const [titleDrafts, setTitleDrafts] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearingCompleted, setIsClearingCompleted] = useState(false);
  const [busyTodoId, setBusyTodoId] = useState<string | null>(null);

  const visibleTodosAtom = useMemo(() => filteredTodosAtom(filter), [filter]);
  const visibleTodos = useAtomValue(visibleTodosAtom);
  const todosCount = useAtomValue(todosCountAtom);
  const activeTodosCount = useAtomValue(activeTodosCountAtom);
  const completedTodosCount = useAtomValue(completedTodosCountAtom);

  const addTodo = useSetAtom(addTodoAtom);
  const toggleTodo = useSetAtom(toggleTodoAtom);
  const updateTodo = useSetAtom(updateTodoAtom);
  const deleteTodo = useSetAtom(deleteTodoAtom);
  const clearCompleted = useSetAtom(clearCompletedAtom);

  const { ensureAuthenticated } = useAuthGate();

  const runProtectedAction = useCallback(
    async (reason: string, action: () => void | Promise<void>) => {
      setActionError(null);
      const result = await ensureAuthenticated(reason);
      if (!result.ok) {
        if (result.code !== "CANCELLED") {
          setActionError(result.message);
        }
        return false;
      }

      await action();
      return true;
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
      const ok = await runProtectedAction("Authenticate to add a todo", () => {
        addTodo(nextTitle);
      });
      if (ok) {
        setNewTitle("");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [addTodo, newTitle, runProtectedAction]);

  const handleToggleTodo = useCallback(
    async (id: string) => {
      setBusyTodoId(id);
      try {
        await runProtectedAction("Authenticate to update this todo", () => {
          toggleTodo(id);
        });
      } finally {
        setBusyTodoId((current) => (current === id ? null : current));
      }
    },
    [runProtectedAction, toggleTodo]
  );

  const handleSaveTitle = useCallback(
    async (todo: Todo) => {
      const nextTitle = (titleDrafts[todo.id] ?? todo.title).trim();
      if (nextTitle.length === 0) {
        setActionError("Todo title cannot be empty.");
        return;
      }

      setBusyTodoId(todo.id);
      try {
        await runProtectedAction("Authenticate to edit this todo", () => {
          updateTodo({ id: todo.id, title: nextTitle });
          setTitleDrafts((prev) => ({ ...prev, [todo.id]: nextTitle }));
        });
      } finally {
        setBusyTodoId((current) => (current === todo.id ? null : current));
      }
    },
    [runProtectedAction, titleDrafts, updateTodo]
  );

  const handleDeleteTodo = useCallback(
    async (id: string) => {
      setBusyTodoId(id);
      try {
        await runProtectedAction("Authenticate to delete this todo", () => {
          deleteTodo(id);
          setTitleDrafts((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        });
      } finally {
        setBusyTodoId((current) => (current === id ? null : current));
      }
    },
    [deleteTodo, runProtectedAction]
  );

  const handleClearCompleted = useCallback(async () => {
    setIsClearingCompleted(true);
    try {
      await runProtectedAction("Authenticate to clear completed todos", () => {
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
          busyTodoId={busyTodoId}
          titleDrafts={titleDrafts}
          onChangeDraft={(id, value) => {
            setTitleDrafts((prev) => ({ ...prev, [id]: value }));
          }}
          onToggle={(id) => {
            void handleToggleTodo(id);
          }}
          onSaveTitle={(todo) => {
            void handleSaveTitle(todo);
          }}
          onDelete={(id) => {
            void handleDeleteTodo(id);
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
