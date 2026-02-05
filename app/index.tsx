import { useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

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
    description: "Tap + to add your first todo.",
  };
}

export default function TodosScreen() {
  const [filter, setFilter] = useState<TodoFilter>("all");
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  const allFilteredTodosAtom = useMemo(
    () => filteredTodosAtom(filter),
    [filter],
  );

  const allFilteredTodos = useAtomValue(allFilteredTodosAtom);
  const todosCount = useAtomValue(todosCountAtom);
  const activeTodosCount = useAtomValue(activeTodosCountAtom);
  const completedTodosCount = useAtomValue(completedTodosCountAtom);

  const {
    actionError,
    isClearingCompleted,
    handleToggleTodo,
    handleClearCompleted,
  } = useProtectedTodoActions();

  const emptyState = getEmptyState(filter);

  return (
    <View
      style={[styles.screen, isDark ? styles.screenDark : styles.screenLight]}
    >
      <View style={styles.topSection}>
        <TodoFilters
          selectedFilter={filter}
          totalCount={todosCount}
          activeCount={activeTodosCount}
          completedCount={completedTodosCount}
          onChangeFilter={setFilter}
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

      <View style={styles.listContainer}>
        <TodoList
          todos={allFilteredTodos}
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
          contentContainerStyle={styles.listContentContainer}
        />
      </View>

      <Pressable
        style={[
          styles.fab,
          isDark ? styles.fabDark : styles.fabLight,
        ]}
        onPress={() => {
          router.push("/todo-actions");
        }}
        accessibilityRole="button"
        accessibilityLabel="Add todo"
      >
        <Text style={styles.fabLabel}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  screenLight: {
    backgroundColor: "#f5f5f5",
  },
  screenDark: {
    backgroundColor: "#0a0a0a",
  },
  topSection: {
    gap: 12,
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
  listContainer: {
    flex: 1,
    marginTop: 12,
  },
  listContentContainer: {
    paddingBottom: 92,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabLight: {
    backgroundColor: "#2563eb",
  },
  fabDark: {
    backgroundColor: "#3b82f6",
  },
  fabLabel: {
    fontSize: 30,
    lineHeight: 32,
    color: "#ffffff",
    fontWeight: "300",
    marginTop: -2,
  },
});
