import { Link } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import { AuthLevel } from "@/features/auth/types";
import {
  activeTodosCountAtom,
  addTodoAtom,
  completedTodosCountAtom,
  filteredTodosAtom,
  limitedTodosAtom,
  todosCountAtom,
} from "@/features/todos/_atoms/todos";
import { AddTodoForm } from "@/features/todos/components/AddTodoForm";
import { TodoFilters } from "@/features/todos/components/TodoFilters";
import { TodoList } from "@/features/todos/components/TodoList";
import type { TodoFilter } from "@/features/todos/types";
import { useProtectedTodoActions } from "@/features/todos/useProtectedTodoActions";

const TODO_LIMIT = 5;

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDark = useColorScheme() === "dark";

  const allFilteredTodosAtom = useMemo(
    () => filteredTodosAtom(filter),
    [filter],
  );
  const visibleTodosAtom = useMemo(
    () => limitedTodosAtom(filter, TODO_LIMIT),
    [filter],
  );
  const allFilteredTodos = useAtomValue(allFilteredTodosAtom);
  const visibleTodos = useAtomValue(visibleTodosAtom);
  const todosCount = useAtomValue(todosCountAtom);
  const activeTodosCount = useAtomValue(activeTodosCountAtom);
  const completedTodosCount = useAtomValue(completedTodosCountAtom);
  const hasHiddenTodos = allFilteredTodos.length > visibleTodos.length;

  const addTodo = useSetAtom(addTodoAtom);
  const {
    actionError,
    isClearingCompleted,
    runProtectedAction,
    handleToggleTodo,
    handleClearCompleted,
  } = useProtectedTodoActions();

  const handleAddTodo = async () => {
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
        },
      );
      if (result !== null) {
        setNewTitle("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const emptyState = getEmptyState(filter);

  return (
    <ScrollView
      style={[styles.screen, isDark ? styles.screenDark : styles.screenLight]}
      contentContainerStyle={styles.screenContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topSection}>
        <View>
          <Text
            style={[
              styles.heading,
              isDark ? styles.headingDark : styles.headingLight,
            ]}
          >
            Todos
          </Text>
          <Text
            style={[
              styles.subheading,
              isDark ? styles.subheadingDark : styles.subheadingLight,
            ]}
          >
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
          <Text
            style={[
              styles.errorText,
              isDark ? styles.errorTextDark : styles.errorTextLight,
            ]}
          >
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

        {allFilteredTodos.length > 0 ? (
          <Text
            style={[
              styles.countText,
              isDark ? styles.countTextDark : styles.countTextLight,
            ]}
          >
            Showing {visibleTodos.length} of {allFilteredTodos.length} todos
          </Text>
        ) : null}

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
              Clear
            </Button>
          </View>

          <View style={styles.flexOne}>
            <Link href="/settings" asChild>
              <Button
                variant="secondary"
                accessibilityLabel="Open settings screen"
              >
                Settings
              </Button>
            </Link>
          </View>

          {hasHiddenTodos ? (
            <View style={styles.flexOne}>
              <Link href="/all-todos" asChild>
                <Button variant="secondary" accessibilityLabel="Show all todos">
                  All
                </Button>
              </Link>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.listContainer}>
        <TodoList
          todos={visibleTodos}
          scrollEnabled={false}
          onToggle={(id) => {
            void handleToggleTodo(id);
          }}
          emptyTitle={emptyState.title}
          emptyDescription={emptyState.description}
          emptyActionLabel={filter === "all" ? undefined : "All todos"}
          onEmptyAction={
            filter === "all"
              ? undefined
              : () => {
                  setFilter("all");
                }
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
  },
  screenContent: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 16,
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
  countText: {
    fontSize: 14,
  },
  countTextLight: {
    color: "#525252",
  },
  countTextDark: {
    color: "#d4d4d4",
  },
  flexOne: {
    flex: 1,
  },
  listContainer: {
    marginTop: 16,
  },
});
