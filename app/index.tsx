import { Link } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

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

export default function TodosScreen() {
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [newTitle, setNewTitle] = useState("");
  const [titleDrafts, setTitleDrafts] = useState<Record<string, string>>({});

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
    async (reason: string, action: () => void) => {
      const result = await ensureAuthenticated(reason);
      if (!result.ok && result.code !== "CANCELLED") {
        Alert.alert("Authentication", result.message);
        return;
      }
      if (result.ok) {
        action();
      }
    },
    [ensureAuthenticated]
  );

  const handleAddTodo = useCallback(async () => {
    const nextTitle = newTitle.trim();
    if (nextTitle.length === 0) {
      Alert.alert("Validation", "Please enter a todo title.");
      return;
    }

    await runProtectedAction("Authenticate to add a todo", () => {
      addTodo(nextTitle);
      setNewTitle("");
    });
  }, [addTodo, newTitle, runProtectedAction]);

  const handleToggleTodo = useCallback(
    async (id: string) => {
      await runProtectedAction("Authenticate to update this todo", () => {
        toggleTodo(id);
      });
    },
    [runProtectedAction, toggleTodo]
  );

  const handleSaveTitle = useCallback(
    async (todo: Todo) => {
      const nextTitle = (titleDrafts[todo.id] ?? todo.title).trim();
      if (nextTitle.length === 0) {
        Alert.alert("Validation", "Todo title cannot be empty.");
        return;
      }

      await runProtectedAction("Authenticate to edit this todo", () => {
        updateTodo({ id: todo.id, title: nextTitle });
        setTitleDrafts((prev) => ({ ...prev, [todo.id]: nextTitle }));
      });
    },
    [runProtectedAction, titleDrafts, updateTodo]
  );

  const handleDeleteTodo = useCallback(
    async (id: string) => {
      await runProtectedAction("Authenticate to delete this todo", () => {
        deleteTodo(id);
      });
    },
    [deleteTodo, runProtectedAction]
  );

  const handleClearCompleted = useCallback(async () => {
    await runProtectedAction("Authenticate to clear completed todos", () => {
      clearCompleted();
    });
  }, [clearCompleted, runProtectedAction]);

  const renderTodo = useCallback(
    ({ item }: { item: Todo }) => {
      const titleDraft = titleDrafts[item.id] ?? item.title;

      return (
        <View className="rounded-xl border border-neutral-300 p-3 gap-2">
          <Text className="text-xs opacity-60">
            Created: {new Date(item.createdAtMs).toLocaleString()}
          </Text>
          <Text className="text-xs opacity-60">
            Updated: {new Date(item.updatedAtMs).toLocaleString()}
          </Text>
          <TextInput
            className="rounded-lg border border-neutral-300 px-3 py-2"
            value={titleDraft}
            onChangeText={(nextValue) =>
              setTitleDrafts((prev) => ({ ...prev, [item.id]: nextValue }))
            }
          />
          <View className="flex-row gap-2">
            <Pressable
              className={`px-3 py-2 rounded-lg ${
                item.completed ? "bg-amber-500" : "bg-emerald-600"
              }`}
              onPress={() => {
                void handleToggleTodo(item.id);
              }}
            >
              <Text className="text-white font-medium">
                {item.completed ? "Mark active" : "Mark done"}
              </Text>
            </Pressable>

            <Pressable
              className="bg-blue-600 px-3 py-2 rounded-lg"
              onPress={() => {
                void handleSaveTitle(item);
              }}
            >
              <Text className="text-white font-medium">Save title</Text>
            </Pressable>

            <Pressable
              className="bg-red-600 px-3 py-2 rounded-lg"
              onPress={() => {
                void handleDeleteTodo(item.id);
              }}
            >
              <Text className="text-white font-medium">Delete</Text>
            </Pressable>
          </View>
        </View>
      );
    },
    [handleDeleteTodo, handleSaveTitle, handleToggleTodo, titleDrafts]
  );

  const filterButton = useCallback(
    (value: TodoFilter, label: string) => (
      <Pressable
        key={value}
        className={`px-3 py-2 rounded-lg ${
          filter === value ? "bg-black" : "bg-neutral-300"
        }`}
        onPress={() => setFilter(value)}
      >
        <Text className={filter === value ? "text-white" : "text-black"}>
          {label}
        </Text>
      </Pressable>
    ),
    [filter]
  );

  const emptyState = visibleTodos.length === 0;
  const canClearCompleted = completedTodosCount > 0;

  return (
    <View className="flex-1 p-4 gap-3">
      <Text className="text-2xl font-bold">Todos</Text>
      <Text className="opacity-80">
        Phase 2 CRUD harness with AsyncStorage-backed Jotai atoms.
      </Text>

      <Text className="opacity-80">
        Total: {todosCount} | Active: {activeTodosCount} | Completed:{" "}
        {completedTodosCount}
      </Text>

      <View className="gap-2">
        <TextInput
          className="rounded-lg border border-neutral-300 px-3 py-2"
          value={newTitle}
          onChangeText={setNewTitle}
          placeholder="New todo title"
        />
        <View className="flex-row gap-2">
          <Pressable
            className="bg-blue-600 px-4 py-3 rounded-xl self-start active:opacity-80"
            onPress={() => {
              void handleAddTodo();
            }}
          >
            <Text className="text-white font-semibold">Add todo</Text>
          </Pressable>
          <Pressable
            className="bg-neutral-800 px-4 py-3 rounded-xl self-start active:opacity-80"
            onPress={() => {
              void handleClearCompleted();
            }}
            disabled={!canClearCompleted}
            style={canClearCompleted ? undefined : { opacity: 0.4 }}
          >
            <Text className="text-white font-semibold">Clear completed</Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-row gap-2">
        {filterButton("all", "All")}
        {filterButton("active", "Active")}
        {filterButton("completed", "Completed")}
      </View>

      {emptyState ? (
        <View className="rounded-lg border border-dashed border-neutral-300 p-4">
          <Text className="opacity-80">
            No todos for this filter. Add one to test persistence.
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleTodos}
          keyExtractor={(item) => item.id}
          renderItem={renderTodo}
          contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
        />
      )}

      <Link href="/settings" asChild>
        <Pressable className="bg-black px-4 py-3 rounded-xl self-start">
          <Text className="text-white font-semibold">Open settings</Text>
        </Pressable>
      </Link>
    </View>
  );
}
