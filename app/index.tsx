import { Link } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";

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
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearingCompleted, setIsClearingCompleted] = useState(false);
  const isDark = useColorScheme() === "dark";

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
      await runProtectedAction("Authenticate to clear completed todos", AuthLevel.CRITICAL, () => {
        clearCompleted();
      });
    } finally {
      setIsClearingCompleted(false);
    }
  }, [clearCompleted, runProtectedAction]);

  const emptyState = getEmptyState(filter);

  return (
    <View style={[styles.screen, isDark ? styles.screenDark : styles.screenLight]}>
      <View style={styles.topSection}>
        <View>
          <Text style={[styles.heading, isDark ? styles.headingDark : styles.headingLight]}>Todos</Text>
          <Text style={[styles.subheading, isDark ? styles.subheadingDark : styles.subheadingLight]}>
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
          <Text style={[styles.errorText, isDark ? styles.errorTextDark : styles.errorTextLight]}>
            {actionError}
          </Text>
        ) : null}

        <TodoFilters
          selectedFilter={filter}
          totalCount={todosCount}
          activeCount={activeTodosCount}
          completedCount={completedTodosCount}
          onChangeFilter={setFilter}
        />

        <View style={styles.actionRow}>
          <View style={styles.flexOne}>
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

          <View style={styles.flexOne}>
            <Link href="/settings" asChild>
              <Button variant="secondary" accessibilityLabel="Open settings screen">
                Settings
              </Button>
            </Link>
          </View>
        </View>
      </View>

      <View style={styles.listContainer}>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  screenLight: {
    backgroundColor: "#f5f5f5",
  },
  screenDark: {
    backgroundColor: "#0a0a0a",
  },
  topSection: {
    gap: 16,
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
  },
  headingLight: {
    color: "#171717",
  },
  headingDark: {
    color: "#f5f5f5",
  },
  subheading: {
    marginTop: 4,
    fontSize: 14,
  },
  subheadingLight: {
    color: "#525252",
  },
  subheadingDark: {
    color: "#d4d4d4",
  },
  errorText: {
    fontSize: 14,
  },
  errorTextLight: {
    color: "#dc2626",
  },
  errorTextDark: {
    color: "#f87171",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  flexOne: {
    flex: 1,
  },
  listContainer: {
    marginTop: 16,
    flex: 1,
  },
});
