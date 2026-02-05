import type { Todo } from "@/features/todos/types";
import { getItem, removeItem, setItem } from "./async-storage";

export const TODOS_KEY = "todos:v1";
const LEGACY_TODOS_KEY = "todos";

function isTodo(value: unknown): value is Todo {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const maybeTodo = value as Partial<Todo>;
  return (
    typeof maybeTodo.id === "string" &&
    typeof maybeTodo.title === "string" &&
    typeof maybeTodo.createdAtMs === "number" &&
    typeof maybeTodo.updatedAtMs === "number" &&
    typeof maybeTodo.completed === "boolean"
  );
}

function normalizeTodo(value: unknown): Todo | null {
  if (!isTodo(value)) {
    return null;
  }

  const todo = value as Todo;
  return {
    id: todo.id,
    title: todo.title,
    description: typeof todo.description === "string" ? todo.description : "",
    createdAtMs: todo.createdAtMs,
    updatedAtMs: todo.updatedAtMs,
    completed: todo.completed,
  };
}

function parseTodos(raw: string | null): Todo[] | null {
  if (raw === null) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((todo) => normalizeTodo(todo))
      .filter((todo): todo is Todo => todo !== null);
  } catch {
    return [];
  }
}

export async function loadTodos(): Promise<Todo[]> {
  const currentTodos = parseTodos(await getItem(TODOS_KEY));
  if (currentTodos !== null) {
    return currentTodos;
  }

  const legacyTodos = parseTodos(await getItem(LEGACY_TODOS_KEY));
  if (legacyTodos === null) {
    return [];
  }

  await saveTodos(legacyTodos);
  await removeItem(LEGACY_TODOS_KEY);
  return legacyTodos;
}

export async function saveTodos(todos: Todo[]): Promise<void> {
  await setItem(TODOS_KEY, JSON.stringify(todos));
}
