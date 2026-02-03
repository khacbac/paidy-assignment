import { atomWithAsyncStorage } from "@/lib/jotai";
import { TODOS_KEY } from "@/lib/storage";
import { atom } from "jotai";

import type { Todo, TodoFilter, TodoId } from "../types";

export type UpdateTodoPayload = {
  id: TodoId;
  title: string;
};

function createTodoId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const todosAtom = atomWithAsyncStorage<Todo[]>(TODOS_KEY, []);

export const todosCountAtom = atom((get) => get(todosAtom).length);
export const activeTodosCountAtom = atom(
  (get) => get(todosAtom).filter((todo) => !todo.completed).length
);
export const completedTodosCountAtom = atom(
  (get) => get(todosAtom).filter((todo) => todo.completed).length
);

export const addTodoAtom = atom(null, (get, set, title: string) => {
  const nextTitle = title.trim();
  if (nextTitle.length === 0) {
    return;
  }

  const nowMs = Date.now();
  const todo: Todo = {
    id: createTodoId(),
    title: nextTitle,
    createdAtMs: nowMs,
    updatedAtMs: nowMs,
    completed: false,
  };

  set(todosAtom, [todo, ...get(todosAtom)]);
});

export const toggleTodoAtom = atom(null, (get, set, id: TodoId) => {
  const nowMs = Date.now();
  set(
    todosAtom,
    get(todosAtom).map((todo) =>
      todo.id === id
        ? { ...todo, completed: !todo.completed, updatedAtMs: nowMs }
        : todo
    )
  );
});

export const updateTodoAtom = atom(
  null,
  (get, set, payload: UpdateTodoPayload) => {
    const nextTitle = payload.title.trim();
    if (nextTitle.length === 0) {
      return;
    }

    const nowMs = Date.now();
    set(
      todosAtom,
      get(todosAtom).map((todo) =>
        todo.id === payload.id
          ? { ...todo, title: nextTitle, updatedAtMs: nowMs }
          : todo
      )
    );
  }
);

export const deleteTodoAtom = atom(null, (get, set, id: TodoId) => {
  set(
    todosAtom,
    get(todosAtom).filter((todo) => todo.id !== id)
  );
});

export const clearCompletedAtom = atom(null, (get, set) => {
  set(
    todosAtom,
    get(todosAtom).filter((todo) => !todo.completed)
  );
});

export const filteredTodosAtom = (filter: TodoFilter) =>
  atom((get) => {
    const todos = get(todosAtom);
    if (filter === "active") {
      return todos.filter((todo) => !todo.completed);
    }
    if (filter === "completed") {
      return todos.filter((todo) => todo.completed);
    }
    return todos;
  });
