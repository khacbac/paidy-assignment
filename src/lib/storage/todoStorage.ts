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

function parseTodos(raw: string | null): Todo[] | null {
  if (raw === null) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isTodo);
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
