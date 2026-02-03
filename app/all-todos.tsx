import { Link } from "expo-router";
import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { Button } from "@/components/Button";
import {
  activeTodosCountAtom,
  completedTodosCountAtom,
  filteredTodosAtom,
  todosCountAtom,
} from "@/features/todos/_atoms/todos";
import { TodoFilters } from "@/features/todos/components/TodoFilters";
import { TodoList } from "@/features/todos/components/TodoList";
import type { TodoFilter } from "@/features/todos/types";
import { useProtectedTodoActions } from "@/features/todos/useProtectedTodoActions";

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

export default function AllTodosScreen() {
  const [filter, setFilter] = useState<TodoFilter>("all");
  const isDark = useColorScheme() === "dark";

  const visibleTodosAtom = useMemo(() => filteredTodosAtom(filter), [filter]);
  const visibleTodos = useAtomValue(visibleTodosAtom);
  const todosCount = useAtomValue(todosCountAtom);
  const activeTodosCount = useAtomValue(activeTodosCountAtom);
  const completedTodosCount = useAtomValue(completedTodosCountAtom);

  const {
    actionError,
    isClearingCompleted,
    handleToggleTodo,
    handleSaveTitle,
    handleDeleteTodo,
    handleDuplicateTodo,
    handleClearCompleted,
  } = useProtectedTodoActions();

  const emptyState = getEmptyState(filter);

  return (
    <View
      style={[styles.screen, isDark ? styles.screenDark : styles.screenLight]}
    >
      <View style={styles.topSection}>
        <View>
          <Text
            style={[
              styles.heading,
              isDark ? styles.headingDark : styles.headingLight,
            ]}
          >
            All Todos
          </Text>
          <Text
            style={[
              styles.subheading,
              isDark ? styles.subheadingDark : styles.subheadingLight,
            ]}
          >
            Review and manage your full todo list.
          </Text>
        </View>

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

        {visibleTodos.length > 0 ? (
          <Text
            style={[
              styles.countText,
              isDark ? styles.countTextDark : styles.countTextLight,
            ]}
          >
            Showing all {visibleTodos.length} todos
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
              Clear Completed
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
  countText: {
    fontSize: 14,
  },
  countTextLight: {
    color: "#525252",
  },
  countTextDark: {
    color: "#d4d4d4",
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
